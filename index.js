//
const Discord = require('discord.js');
const { GatewayIntentBits, Partials, EmbedBuilder, Colors } = require('discord.js');
const config = require(`./config.json`);
const db = require('quick.db');
const handler = require("./handlers/loadslash");
const cron = require('node-cron');
const fs = require('fs');
const chalk = require('chalk');
const axios = require('axios');
const InvitesTracker = require('@androz2091/discord-invites-tracker');
const UserData1 = require('./models/userData.js');
const autoDeleteHandler = require('./handlers/autodelete');

console.log(chalk.blue("Starting bot initialization..."));

const client = new Discord.Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildInvites,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.User],
});

client.snipes = new Discord.Collection();
client.commands = new Discord.Collection();
client.slash = new Discord.Collection();
client.events = new Discord.Collection();
client.embedColor = config.embedColor || Colors.Blue;

client.db = {
    userData: new db.table("userData"),
    serverCount: new db.table("FreeServerCount"),
    invinfo: new db.table("InviteInfo"),
    invitedBy: new db.table("InvitedByInfo"),
    domains: new db.table("ProxiedDomains"),
    codes: new db.table('Codes'),
    blacklist: new db.table('Blacklist')
};

client.errorEmoji = config.emojis?.error || '❌';
client.successEmoji = config.emojis?.success || '✅';

try {
    require("./handlers/music")(client);
    require(`./handlers/event_handler`)(client);
    require(`./handlers/command_handler`)(client);
    require(`./handlers/mongoose`)(client);
    require(`./handlers/anti_crash`)(process);
    handler.loadSlashCommands(client);
} catch (error) {
    console.error(chalk.red(`Error loading handlers:`), error);
    process.exit(1);
}

cron.schedule('0 * * * *', async () => {
    console.log(chalk.cyan('[CRON] Running hourly server expiration check...'));
    try {
        if (typeof autoDeleteHandler === 'function') {
            await autoDeleteHandler(client);
            console.log(chalk.cyan('[CRON] Hourly server expiration check finished.'));
        } else {
            console.error(chalk.red('[CRON] autoDeleteHandler is not a function or not imported correctly.'));
        }
    } catch (error) {
        console.error(chalk.red('[CRON] Error during hourly server check:'), error);
    }
});

if (config.settings.consoleSave) {
    try {
        require(`./logs/console.log`)();
        console.log(chalk.yellow('[Console] Console logging to file enabled.'));
    } catch (error) {
        console.error(chalk.red('[Console] Failed to enable console saving:'), error);
    }
}

try {
    const tracker = InvitesTracker.init(client, {
        fetchGuilds: true,
        fetchVanity: true,
        fetchAuditLogs: true
    });

    const welcomeText = `Welcome to Luxxy Hosting.`;

    tracker.on('guildMemberAdd', (member, type, invite) => {
        const welcomeChannel = member.guild.channels.cache.get(config.channelID?.welcome);

        if (!welcomeChannel) {
            console.warn(chalk.yellow(`[Welcome] Welcome channel ID not found or not configured in config.channelID.welcome`));
            return;
        }

        let embed;
        let invitedByText = 'Unknown';

        if (type === 'normal' && invite?.inviter) {
            invitedByText = `**${invite.inviter.username}**`;
        } else if (type === 'vanity') {
            invitedByText = '**Vanity URL**';
        } else if (type === 'permissions') {
            welcomeChannel.send(`Welcome <@${member.id}>! I can't figure out how you joined because I lack the "Manage Server" permission!`).catch(console.error);
            return;
        } else if (type === 'unknown') {
            welcomeChannel.send(`Welcome <@${member.id}>! I can't figure out how you joined the server...`).catch(console.error);
            return;
        }

        embed = new EmbedBuilder()
            .setTitle(`Welcome ${member.user.username}`)
            .setDescription(welcomeText)
            .addFields({ name: `Invited by:`, value: invitedByText })
            .setColor(config.embedColor || Colors.Purple)
            .setThumbnail(member.user.displayAvatarURL())
            .setImage('https://media.discordapp.net/attachments/941026457075994698/1000302292857270312/welcome_new_.png')
            .setTimestamp()
            .setFooter({ text: `ID: ${member.id}`, iconURL: member.displayAvatarURL() });

        welcomeChannel.send({ embeds: [embed] }).catch(err => {
            console.error(chalk.red(`[Welcome] Failed to send welcome message for ${member.user.tag}:`), err);
        });
    });

    console.log(chalk.green('[Invites] Invite Tracker initialized.'));

} catch (error) {
    console.error(chalk.red('[Invites] Failed to initialize Invite Tracker:'), error);
}

client.on('guildMemberRemove', async member => {
    console.log(chalk.yellow(`[Leave] Member left: ${member.user.tag} (${member.id})`));
    const leaveLogChannel = client.channels.cache.get(config.channelID?.leavedeletelogs);

    if (!leaveLogChannel) {
        console.warn(chalk.yellow(`[Leave] Leave/Delete log channel ID not configured or found.`));
    }

    try {
        const UserDB = await UserData1.findOne({ ID: member.id });

        if (!UserDB?.consoleID) {
            console.log(chalk.grey(`[Leave] User ${member.user.tag} not found in Mongoose DB or no consoleID.`));
            leaveLogChannel?.send(`User ${member.user.tag} left, but was not found in the database or lacked a consoleID. No Pterodactyl actions taken.`).catch(console.error);
            return;
        }

        console.log(chalk.blue(`[Leave] Found user ${member.user.tag} (ConsoleID: ${UserDB.consoleID}). Checking Pterodactyl...`));
        let serversToDelete = [];
        let pterodactylUserExists = true;

        try {
            const response = await axios({
                url: `${config.pterodactyl.host}/api/application/users/${UserDB.consoleID}?include=servers`,
                method: 'GET',
                timeout: 7000,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            });
            serversToDelete = response.data.attributes.relationships.servers.data.map(e => ({ id: e.attributes.id, name: e.attributes.name }));
            leaveLogChannel?.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(Colors.Orange)
                        .setDescription(`User ${member.user.tag} (ConsoleID: ${UserDB.consoleID}) left with ${serversToDelete.length} server(s). Preparing deletion...`)
                        .setTimestamp()
                ]
            }).catch(console.error);

        } catch (error) {
            if (error.response?.status === 404) {
                console.log(chalk.yellow(`[Leave] Pterodactyl user ${UserDB.consoleID} not found. Skipping server/user deletion.`));
                pterodactylUserExists = false;
                leaveLogChannel?.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Colors.Yellow)
                            .setDescription(`User ${member.user.tag} (ConsoleID: ${UserDB.consoleID}) left, but their Pterodactyl account was not found. No Pterodactyl deletion attempted.`)
                            .setTimestamp()
                    ]
                }).catch(console.error);
            } else {
                console.error(chalk.red(`[Leave] Error fetching Pterodactyl user ${UserDB.consoleID} servers:`), error.response?.data || error.message);
                leaveLogChannel?.send(`Error checking servers for ${member.user.tag} (ConsoleID: ${UserDB.consoleID}). Manual check may be required.`).catch(console.error);
            }
        }

        if (serversToDelete.length > 0 && pterodactylUserExists) {
            console.log(chalk.blue(`[Leave] Starting sequential deletion of ${serversToDelete.length} server(s) for ${member.user.tag}...`));
            leaveLogChannel?.send(`Attempting to delete ${serversToDelete.length} server(s) sequentially...`).catch(console.error);

            for (const server of serversToDelete) {
                leaveLogChannel?.send({
                    embeds: [
                        new EmbedBuilder().setColor(Colors.Red).setTitle(`Deleting server ${server.name} (${server.id})...`)
                    ]
                }).catch(console.error);

                try {
                    await axios({
                        url: `${config.pterodactyl.host}/api/application/servers/${server.id}/force`,
                        method: 'DELETE',
                        timeout: 5000,
                        headers: {
                            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                            'Content-Type': 'application/json',
                            'Accept': 'Application/vnd.pterodactyl.v1+json',
                        }
                    });
                    console.log(chalk.red(`[Leave] Deleted Pterodactyl server ${server.name} (${server.id}) for ${member.user.tag}.`));
                    leaveLogChannel?.send({
                        embeds: [
                            new EmbedBuilder().setColor(Colors.Green).setTitle(`✅ Server ${server.name} (${server.id}) deleted.`)
                        ]
                    }).catch(console.error);
                } catch (err) {
                    console.error(chalk.red(`[Leave] Failed to delete Pterodactyl server ${server.name} (${server.id}):`), err.response?.data || err.message);
                    leaveLogChannel?.send({
                        embeds: [
                            new EmbedBuilder().setColor(Colors.DarkRed).setTitle(`❌ Error deleting server ${server.name} (${server.id})`).setDescription(err.message || 'Unknown error')
                        ]
                    }).catch(console.error);
                }
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            leaveLogChannel?.send(`Finished attempting server deletions for ${member.user.tag}.`).catch(console.error);
        }

        if (pterodactylUserExists) {
            try {
                console.log(chalk.blue(`[Leave] Deleting Pterodactyl user ${UserDB.consoleID} for ${member.user.tag}...`));
                await axios({
                    url: `${config.pterodactyl.host}/api/application/users/${UserDB.consoleID}`,
                    method: 'DELETE',
                    timeout: 5000,
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                    }
                });
                console.log(chalk.red(`[Leave] Deleted Pterodactyl user ${UserDB.consoleID} for ${member.user.tag}.`));
                leaveLogChannel?.send({
                    embeds: [
                        new EmbedBuilder().setColor(Colors.Green).setTitle(`✅ Pterodactyl User ${UserDB.consoleID} deleted.`)
                    ]
                }).catch(console.error);
            } catch (err) {
                if (err.response?.status !== 404) {
                    console.error(chalk.red(`[Leave] Failed to delete Pterodactyl user ${UserDB.consoleID}:`), err.response?.data || err.message);
                    leaveLogChannel?.send({
                        embeds: [
                            new EmbedBuilder().setColor(Colors.DarkRed).setTitle(`❌ Error deleting Pterodactyl user ${UserDB.consoleID}`).setDescription(err.message || 'Unknown error')
                        ]
                    }).catch(console.error);
                } else {
                    console.log(chalk.yellow(`[Leave] Pterodactyl user ${UserDB.consoleID} was already deleted.`));
                }
            }
        }

        try {
            await UserData1.deleteOne({ ID: member.id });
            console.log(chalk.red(`[Leave] Deleted Mongoose DB record for ${member.user.tag} (${member.id}).`));
            leaveLogChannel?.send({
                embeds: [
                    new EmbedBuilder().setColor(Colors.Green).setTitle(`✅ Database record for ${member.user.tag} deleted.`)
                ]
            }).catch(console.error);
        } catch (dbError) {
            console.error(chalk.red(`[Leave] Failed to delete Mongoose DB record for ${member.user.tag}:`), dbError);
            leaveLogChannel?.send({
                embeds: [
                    new EmbedBuilder().setColor(Colors.DarkRed).setTitle(`❌ Error deleting database record for ${member.user.tag}`).setDescription(dbError.message || 'Unknown error')
                ]
            }).catch(console.error);
        }

    } catch (error) {
        console.error(chalk.red(`[Leave] Unhandled error during guildMemberRemove for ${member.user.tag}:`), error);
        leaveLogChannel?.send(`An unexpected error occurred while processing the leave event for ${member.user.tag}. Please check console logs.`).catch(console.error);
    }
});

if (!config.bot?.token) {
    console.error(chalk.red.bold("ERROR: Bot token is missing from config.json!"));
    process.exit(1);
}

client.login(config.bot.token)
    .then(() => {
        console.log(chalk.green.bold("Successfully logged in as " + client.user.tag));
    })
    .catch(err => {
        console.error(chalk.red.bold("Failed to login:"), err);
        process.exit(1);
    });
