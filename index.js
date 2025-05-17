const Discord = require('discord.js');
const { GatewayIntentBits, Partials } = require('discord.js');
const config = require(`./config.json`);
const db = require('quick.db')
const handler = require("./handlers/loadslash");
const cron = require('node-cron');

// dont mind this

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
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.DirectMessageTyping,
        GatewayIntentBits.GuildInvites,
    ],
    partials: [ Partials.Message, Partials.Channel, Partials.Reaction, Partials.User ],
})

//const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'DIRECT_MESSAGES', 'GUILD_PRESENCES', 'GUILD_BANS', 'GUILD_MESSAGE_REACTIONS'], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

console.log("index runing . . .")

client.snipes = new Discord.Collection();
client.commands = new Discord.Collection();
client.slash = new Discord.Collection();
client.events = new Discord.Collection();
global.userData = new db.table("userData");
global.serverCount = new db.table("FreeServerCount");
global.invinfo = new db.table("InviteInfo")
global.invitedBy = new db.table("InvitedByInfo")
global.domains = new db.table("ProxiedDomains")
global.codes = new db.table('Codes')
global.blacklist = new db.table('Blacklist')
global.dir = __dirname;
client.embedColor = 0x0099ff;

global.error = "<:No:979776354486726726>"
global.success = "<:yes:964979709945470977>"

require("./handlers/music")(client);
require(`./handlers/event_handler`)(client);
require(`./handlers/command_handler`)(client);
require(`./handlers/mongoose`)(client);
require(`./handlers/anti_crash`)(process);
handler.loadSlashCommands(client);
// require(`./handlers/autodelete`)(client);
// require(`./handlers/music`)

if(config.settings.consoleSave) require(`./logs/console.log`)()

client.login(config.bot.token);

const InvitesTracker = require('@androz2091/discord-invites-tracker');
const tracker = InvitesTracker.init(client, {
    fetchGuilds: true,
    fetchVanity: true,
    fetchAuditLogs: true
})
welcometext = [
    `Welcome to Luxxy Hosting.`,
]
tracker.on('guildMemberAdd', (member, type, invite) => {
    const welcomeChannel = member.guild.channels.cache.find((ch) => ch.id === '1178443369639321640');

    if(type === 'normal'){

        const NormalEmbed = new Discord.EmbedBuilder()
            .setTitle(`Welcome ${member.user.username}`)
            .setDescription(`${welcometext}`)
            .addFields({ name: `**Invited by:**`, value: `**${invite.inviter.username}**`})
            .setColor('#530A8B')
            .setThumbnail(member.user.displayAvatarURL())
            .setImage('https://media.discordapp.net/attachments/941026457075994698/1000302292857270312/welcome_new_.png')
            .setTimestamp()
            .setFooter({ text: `ID: ${member.id}`, iconURL: member.user.displayAvatarURL()})
        welcomeChannel.send({ embeds: [NormalEmbed] });
        
    } else if(type === 'vanity'){

        const VanityEmbed = new Discord.EmbedBuilder()
            .setTitle(`Welcome ${member.user.username}`)
            .setDescription(`${welcometext}`)
            .addFields({ name: `**Invited by:**`, value: `**Custom Invite**`})
            .setColor('#530A8B')
            .setThumbnail(member.user.displayAvatarURL())
            .setImage('https://media.discordapp.net/attachments/941026457075994698/1000302292857270312/welcome_new_.png')
            .setTimestamp()
            .setFooter({ text: `ID: ${member.id}`, iconURL: member.user.displayAvatarURL()})
        welcomeChannel.send({ embeds: [VanityEmbed] });
        
    } else if(type === 'permissions'){

        welcomeChannel.send(`Welcome <@!${member.id}>! I can't figure out how you joined because I don't have the "Manage Server" permission!`);
        
    } else if(type === 'unknown'){

        welcomeChannel.send(`Welcome <@!${member.id}>! I can't figure out how you joined the server...`);
        
    }
})


const UserData1 = require('./models/userData.js')
const { default: axios } = require('axios')
client.on('guildMemberRemove', async member => {
    const UserDB = await UserData1.findOne({ ID: member.id })
    if (!UserDB) {
        console.log('User is not in the database.')
        client.channels.cache.get(config.channelID.leavedeletelogs).send('🤵 User is not in the database. (mongoose)')
    }
    if (UserDB) {
        await axios({
            url: config.pterodactyl.host + "/api/application/users/" + UserDB.consoleID + "?include=servers",
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).then(async res => {
            const servers1 = res.data.attributes.relationships.servers.data.map(e => e.attributes.id)
            client.channels.cache.get(config.channelID.leavedeletelogs).send({
                embeds: [
                    new Discord.EmbedBuilder()
                    .setColor(Discord.Colors.Red)
                    .setDescription(` 🦺 ${member.user.tag} has left with consoleid ${UserDB.consoleID} with ${servers1.length} servers.`)
                ]
            })
            client.channels.cache.get(config.channelID.leavedeletelogs).send('deleting.....')
            if (servers1.length > 0) {
                await client.channels.cache.get(config.channelID.leavedeletelogs).send({
                    embeds: [
                        new Discord.EmbedBuilder()
                        .setColor(Discord.Colors.Red)
                        .setTitle('🦺 Deleting servers...')
                    ]
                })
                await Promise.all(servers1.map(async server => {
                    client.channels.cache.get(config.channelID.leavedeletelogs).send({ embeds: [
                        new Discord.EmbedBuilder()
                        .setColor(Discord.Colors.Red)
                        .setTitle(`🦺 Deleting server ${server}...`)
                    ]})
                    await axios({
                        url: config.pterodactyl.host + "/api/application/servers/" + server + "/force",
                        method: 'DELETE',
                        followRedirect: true,
                        maxRedirects: 5,
                        headers: {
                            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                            'Content-Type': 'application/json',
                            'Accept': 'Application/vnd.pterodactyl.v1+json',
                        }
                    }).then(async res => {
                        client.channels.cache.get(config.channelID.leavedeletelogs).send({ embeds: [
                            new Discord.EmbedBuilder()
                            .setColor(Discord.Colors.Red)
                            .setTitle(`🦺 Server ${server} deleted.`)
                        ]})
                    }
                    ).catch(err => {
                        client.channels.cache.get(config.channelID.leavedeletelogs).send({ embeds: [
                            new Discord.EmbedBuilder()
                            .setColor(Discord.Colors.Red)
                            .setTitle(`🦺 Error deleting server ${server}`)
                        ]})
                    }
                    )
                }))
            }
            await UserData1.deleteOne({ ID: member.id })
            await axios({
                url: config.pterodactyl.host + "/api/application/users/" + UserDB.consoleID,
                method: 'DELETE',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            }).then(async res => {
                client.channels.cache.get(config.channelID.leavedeletelogs).send({ embeds: [
                    new Discord.EmbedBuilder()
                    .setColor(Discord.Colors.Red)
                    .setTitle(`🦺 User ${UserDB.consoleID} deleted.`)
                ]})
            })
        })
    }
})