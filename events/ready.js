const Discord = require('discord.js');
const chalk = require('chalk');
const config = require('../config.json');
const fs = require('fs');
const { default: axios } = require('axios');
const exec = require('child_process').exec;
const { ActivityType, VoiceConnectionStatus } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

const logSetting = (name, value) => {
  console.log(`   ${chalk.cyan(name.padEnd(25, '.'))} ${value ? chalk.green('Enabled') : chalk.red('Disabled')}`);
};

const timestamp = () => chalk.grey(`[${new Date().toLocaleTimeString()}]`);

let gitHubUpToDateNotified = false;

module.exports = async (client) => {

    console.log(chalk.bold.hex('#6b7dfb')('\n=================================================='));
    console.log(chalk.bold.hex('#6b7dfb')(`  ${client.user.tag} is online!`));
    console.log(chalk.bold.hex('#6b7dfb')('==================================================\n'));

    console.log(chalk.yellow.bold('----- Bot Settings -----'));
    logSetting('Console Saving', config.settings.consoleSave);
    logSetting('Node Status Display', config.settings.nodeStatus);
    logSetting('Maintenance Mode', config.settings.maintenance);
    logSetting('Auto Leave Guilds', config.settings.autoLeave);
    logSetting('Minecraft Port Checker', config.settings.McScript);
    logSetting('Lavalink Status', config.settings.lavalinkStatus);
    logSetting('Server Checker Deleter', config.settings.serverchecker);
    logSetting('Update from GitHub', config.settings.updateFromGithub);
    logSetting('Join Voice Channel', config.settings.joinvoicechannelonready);
    console.log(chalk.yellow.bold('------------------------\n'));

    //client.manager.init(client.user.id);

    try {
        console.log(chalk.magenta('[AutoRun] Initializing autorun scripts...'));
        const autorunFiles = fs.readdirSync(`./autoRun`).filter(file => file.endsWith('.js'));
        if (autorunFiles.length > 0) {
            autorunFiles.forEach(file => {
                console.log(chalk.magenta(`  ↳ Loading: ${file}`));
                require(`../autoRun/${file}`)(client);
            });
            console.log(chalk.magenta('[AutoRun] Autorun scripts loaded successfully.\n'));
        } else {
             console.log(chalk.magenta('[AutoRun] No autorun scripts found.\n'));
        }
    } catch (error) {
        console.error(chalk.red('[AutoRun] Error loading autorun scripts:'), error);
    }

    client.user.setPresence({
        activities: [{ name: `I'm on top of the world because of you`, type: ActivityType.Custom }],
        status: 'online',
    });
    console.log(chalk.blue('[Presence] Bot presence set.\n'));

    if (config.settings.joinvoicechannelonready) {
        try {
            const channel = client.channels.cache.get('1411294900917637271');
            if (!channel) {
                console.error(chalk.red('[Voice] Cannot find specified voice channel (ID: 1411294900917637271).'));
            } else if (!channel.isVoiceBased()) {
                 console.error(chalk.red(`[Voice] Channel ${channel.name} is not a voice-based channel.`));
            } else {
                console.log(chalk.blue('[Voice] Attempting to join voice channel...'));
                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: config.settings.guildID,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                    selfDeaf: true,
                });

                connection.on(VoiceConnectionStatus.Ready, () => {
                    console.log(chalk.green.bold('[Voice] Successfully joined voice channel and ready.'));
                });
                 connection.on(VoiceConnectionStatus.Connecting, () => {
                     console.log(chalk.blue('[Voice] Connecting to voice channel...'));
                 });
                connection.on(VoiceConnectionStatus.Disconnected, () => {
                    console.warn(chalk.yellow('[Voice] Disconnected from voice channel. Attempting to rejoin if possible...'));
                });
                connection.on(VoiceConnectionStatus.Destroyed, () => {
                    console.log(chalk.red('[Voice] Voice connection destroyed.'));
                });
                connection.on('error', error => {
                    console.error(chalk.red('[Voice] Voice Connection Error:'), error);
                });
            }
        } catch (error) {
            console.error(chalk.red('[Voice] Error joining voice channel:'), error);
        }

    } else {
        console.log(chalk.yellow('[Voice] Auto-join voice channel disabled in config.\n'));
    }

    if (config.settings.updateFromGithub) {
        console.log(chalk.blue('[GitHub] Auto-update check interval started (every 30s).\n'));
        setInterval(async () => {
            exec(`git pull origin master`, async (error, stdout) => {
                let response = (error || stdout);
                if (!error) {
                    if (!response.includes("Already up to date.")) {
                        console.log(timestamp() + chalk.yellow.bold('[GitHub] New update found! Pulling changes...'));
                        try {
                            const githubChannel = client.channels.cache.get(config.channelID.github);
                            if (githubChannel) {
                                await githubChannel.send({
                                    content: "**RESTARTING Bot for Update...**",
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setTitle(`**[GitHub Auto-Pull]**`)
                                            .setColor(Discord.Colors.Blue)
                                            .setDescription(`Found new changes on GitHub. Pulling & Restarting...\n\`\`\`\n${response.substring(0, 1900)}\`\`\``)
                                            .setTimestamp()
                                    ]
                                });
                            }
                        } catch (embedError) {
                             console.error(timestamp() + chalk.red('[GitHub] Failed to send update notification to Discord:'), embedError);
                        }
                        console.log(timestamp() + chalk.yellow.bold('[GitHub] Update pulled successfully. Restarting process...'));
                        process.exit();
                    } else {
                        if (!gitHubUpToDateNotified) {
                            console.log(timestamp() + chalk.green('[GitHub] Bot is up to date with origin/master.'));
                            gitHubUpToDateNotified = true;
                        }
                    }
                } else {
                    console.error(timestamp() + chalk.red('[GitHub] Failed to pull from repository:'), error);
                }
            });
        }, 30000);
    } else {
         console.log(chalk.yellow('[GitHub] Auto-update from GitHub disabled in config.\n'));
    }

    console.log(chalk.blue('[Stats] Dynamic channel name update interval started (every 60s).\n'));
    setInterval(() => {
        const currentTimestamp = timestamp();

        try {
            let guild = client.guilds.cache.get(config.settings.guildID);
            if (guild) {
                let memberCount = guild.members.cache.filter(member => !member.user.bot).size.toLocaleString();
                client.channels.cache.get(config.voiceID.members)?.edit({ name: `Total Members: ${memberCount}` })
                    .catch(err => console.error(currentTimestamp + chalk.red(`[Stats] Error updating member count channel:`), err.message));
            } else {
                console.warn(currentTimestamp + chalk.yellow(`[Stats] Could not find guild with ID ${config.settings.guildID} for member count.`));
            }
        } catch (error) {
            console.error(currentTimestamp + chalk.red('[Stats] Error fetching member count:'), error);
        }

        axios({
            url: config.pterodactyl.host + "/api/application/servers",
            method: 'GET',
            timeout: 5000,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then(response => {
            client.channels.cache.get(config.voiceID.servers)?.edit({ name: `Total Servers: ${response.data.meta.pagination.total.toLocaleString()}` })
                 .catch(err => console.error(currentTimestamp + chalk.red(`[Stats] Error updating server count channel:`), err.message));
        }).catch(error => {
            console.error(currentTimestamp + chalk.red('[Stats] Failed to fetch Pterodactyl server count:'), error.message);
        });

        axios({
            url: config.pterodactyl.host + "/api/application/users",
            method: 'GET',
            timeout: 5000,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then(response => {
            client.channels.cache.get(config.voiceID.clients)?.edit({ name: `Total Users: ${response.data.meta.pagination.total.toLocaleString()}` })
                .catch(err => console.error(currentTimestamp + chalk.red(`[Stats] Error updating user count channel:`), err.message));
        }).catch(error => {
             console.error(currentTimestamp + chalk.red('[Stats] Failed to fetch Pterodactyl user count:'), error.message);
        });

    }, 60000);

    if (config.settings.autoLeave) {
        console.log(chalk.yellow('\n[Guilds] Checking for guilds to leave...'));
        client.guilds.cache.forEach(g => {
            if (g.id === config.settings.guildID) return;
            console.log(chalk.yellow(`  ↳ Leaving guild: ${chalk.bold(g.name)} (${g.id})`));
            g.leave().catch(err => console.error(chalk.red(`[Guilds] Failed to leave guild ${g.name} (${g.id}):`), err));
        });
         console.log(chalk.yellow('[Guilds] Guild check complete.\n'));
    }

    console.log(chalk.green.bold(`\nClient Ready! Logged in as ${client.user.tag}. Listening for events...\n`));

};