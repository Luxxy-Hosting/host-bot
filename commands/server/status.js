const axios = require('axios');
const pretty = require('prettysize');
const format = require('format-duration');
const Discord = require('discord.js');
const config = require('../../config.json');
const userData = require('../../models/userData');

module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id });

    if (!userDB) {
        return message.reply('You don\'t have an account created. Type `' + config.bot.prefix + 'user new` to create one');
    }

    args = args.slice(1);
    let server = args[0]?.split('-')[0];

    if (!server) {
        let embed = new Discord.EmbedBuilder()
            .setColor(Discord.Colors.Green)
            .addField("__**Server Status**__", "What server should I display?\nCommand Format: `" + config.bot.prefix + "server status <server id>`");
        return message.channel.send({ embeds: [embed] });
    }

    message.channel.send('Checking server `' + server + '`\nPlease wait, it won\'t take more than 10 seconds').then((msg) => {
        axios({
            url: config.pterodactyl.host + "/api/application/users/" + userDB.consoleID + "?include=servers",
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).then(response => {
            const preoutput = response.data.attributes.relationships.servers.data;
            const output = preoutput.find(srv => srv.attributes ? srv.attributes.identifier == server : false);

            setTimeout(async () => {
                if (!output) {
                    msg.edit(':x: | Sorry, but I didn\'t find that server in your list!');
                } else {
                    if (output.attributes.user = userDB.consoleID) {
                        axios({
                            url: config.pterodactyl.host + '/api/client/servers/' + server,
                            method: 'GET',
                            followRedirect: true,
                            maxRedirects: 5,
                            headers: {
                                'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                'Content-Type': 'application/json',
                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                            }
                        }).then(response => {
                            axios({
                                url: config.pterodactyl.host + '/api/client/servers/' + server + "/resources",
                                method: 'GET',
                                followRedirect: true,
                                maxRedirects: 5,
                                headers: {
                                    'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                    'Content-Type': 'application/json',
                                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                                }
                            }).then(resources => {
                                let getUptime = (originalUptime) => {
                                    let filanresult;
                                    let array = format(originalUptime).split(':');
                                    let length = array.length;
                                    filanresult = `${array[length - 4] ? `${array[length - 4]}d ` : ""}${array[length - 3] ? `${array[length - 3]}h ` : ""}${array[length - 2] ? `${array[length - 2]}m ` : ""}${array[length - 1] ? `${array[length - 1]}s` : ""}`;
                                    return filanresult;
                                }

                                let srvname = response.data.attributes.name;
                                msg.edit({
                                    content: "<@" + message.author.id + ">",
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setTitle("Your Server Status")
                                            //.setColor(`${resources.data.attributes.current_state == 'running' ? Discord.Colors.Green : resources.data.attributes.current_state == 'offline' ? Discord.Colors.Red : Discord.Colors.Yellow}`)
                                            .setDescription(`**Status:** \`${resources.data.attributes.current_state == 'running' ? '🟢 Running' : resources.data.attributes.current_state == 'offline' ? '🔴 Offline' : "🔄" + resources.data.attributes.current_state}\`\n`
                                                + `**Name:** \`${srvname}\`\n`
                                                + `**Uptime:** \`${getUptime(resources.data.attributes.resources.uptime)}\`\n`
                                                + `**Cpu:** \`${resources.data.attributes.resources.cpu_absolute}%\`\n`
                                                + `**Ram:** \`${pretty(resources.data.attributes.resources.memory_bytes)}\`\n`
                                                + `**Disk:** \`${pretty(resources.data.attributes.resources.disk_bytes)}\`\n`
                                                + `**Net:** \`⬆️${pretty(resources.data.attributes.resources.network_tx_bytes)}/${pretty(resources.data.attributes.resources.network_rx_bytes)}⬇️\`\n`
                                                + `**Node:** \`${response.data.attributes.node}\`\n`
                                                + `**Full Id:** \`${response.data.attributes.uuid}\`\n`
                                            )
                                    ],
                                    components: [
                                        new Discord.ActionRowBuilder()
                                        .addComponents(
                                            new Discord.ButtonBuilder()
                                            .setCustomId('start')
                                            .setLabel('🟢 Start')
                                            .setStyle('Success'),
                                        )
                                        .addComponents(
                                            new Discord.ButtonBuilder()
                                            .setCustomId('restart')
                                            .setLabel('🔄 Restart')
                                            .setStyle('Primary'),
                                        )
                                        .addComponents(
                                            new Discord.ButtonBuilder()
                                            .setCustomId('stop')
                                            .setLabel('🔴 Stop')
                                            .setStyle('Danger'),
                                        )
                                        .addComponents(
                                            new Discord.ButtonBuilder()
                                            .setLabel('🔗 Link')
                                            .setURL(`${config.pterodactyl.host}/server/${server}`)
                                            .setStyle('Link'),
                                        )
                                        ]
                                });

                                const filter = m => m.user.id === message.author.id;
                                const collector = msg.createMessageComponentCollector({ filter, max: 1, time: 20000 });

                                collector.on('collect', async i => {
                                    if (i.customId === "start") {
                                        axios({
                                            url: config.pterodactyl.host + '/api/client/servers/' + server + "/power",
                                            method: 'POST',
                                            followRedirect: true,
                                            maxRedirects: 5,
                                            headers: {
                                                'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                                'Content-Type': 'application/json',
                                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                                            },
                                            data: {
                                                "signal": "start"
                                            },
                                        }).then(response => {
                                            i.reply(`✅ | Server \`${srvname}\` successfully started`).then(() => {
                                                setTimeout(() => {
                                                    i.deleteReply()
                                                }, 5000)
                                            });
                                            collector.stop();
                                        }).catch(err => {
                                            msg.edit({
                                                embeds: [
                                                    new Discord.EmbedBuilder()
                                                        .setTitle(`:x: | ${err}`)
                                                        .setColor(Discord.Colors.Red)
                                                ]
                                            });
                                        });
                                    }
                                    if (i.customId === "restart") {
                                        axios({
                                            url: config.pterodactyl.host + '/api/client/servers/' + server + "/power",
                                            method: 'POST',
                                            followRedirect: true,
                                            maxRedirects: 5,
                                            headers: {
                                                'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                                'Content-Type': 'application/json',
                                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                                            },
                                            data: {
                                                "signal": "kill"
                                            },
                                        }).then(response => {
                                            setTimeout(() => {
                                                axios({
                                                    url: config.pterodactyl.host + '/api/client/servers/' + server + "/power",
                                                    method: 'POST',
                                                    followRedirect: true,
                                                    maxRedirects: 5,
                                                    headers: {
                                                        'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                                        'Content-Type': 'application.json',
                                                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                                                    },
                                                    data: {
                                                        "signal": "start"
                                                    },
                                                }).then(response => {
                                                    i.reply(`🔄 | Server \`${srvname}\` successfully restarted`).then(() => {
                                                        setTimeout(() => {
                                                            i.deleteReply()
                                                        }, 5000)
                                                    });
                                                    collector.stop();
                                                }).catch(err => {
                                                    msg.edit({
                                                        embeds: [
                                                            new Discord.EmbedBuilder()
                                                                .setTitle(`:x: | ${err}`)
                                                                .setColor(Discord.Colors.Red)
                                                        ]
                                                    });
                                                });
                                            }, 500);
                                        }).catch(err => {
                                            msg.edit({
                                                embeds: [
                                                    new Discord.EmbedBuilder()
                                                        .setTitle(`:x: | ${err}`)
                                                        .setColor(Discord.Colors.Red)
                                                ]
                                            });
                                        });
                                    }
                                    if (i.customId === "stop") {
                                        axios({
                                            url: config.pterodactyl.host + '/api/client/servers/' + server + "/power",
                                            method: 'POST',
                                            followRedirect: true,
                                            maxRedirects: 5,
                                            headers: {
                                                'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                                'Content-Type': 'application/json',
                                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                                            },
                                            data: {
                                                "signal": "kill"
                                            },
                                        }).then(response => {
                                            i.reply(`🔴 | Server \`${srvname}\` successfully stopped`).then(() => {
                                                setTimeout(() => {
                                                    i.deleteReply()
                                                }, 5000)
                                            });
                                            collector.stop();
                                        }).catch(err => {
                                            msg.edit({
                                                embeds: [
                                                    new Discord.EmbedBuilder()
                                                        .setTitle(`:x: | ${err}`)
                                                        .setColor(Discord.Colors.Red)
                                                ]
                                            });
                                        });
                                    }
                                });

                                collector.on('end', (collected, reason) => {
                                    msg.edit({
                                        components: [
                                            new Discord.ActionRowBuilder()
                                                .addComponents(
                                                    new Discord.ButtonBuilder()
                                                        .setCustomId('start')
                                                        .setLabel('🟢 Start')
                                                        .setStyle('Success')
                                                        .setDisabled(true),
                                                )
                                                .addComponents(
                                                    new Discord.ButtonBuilder()
                                                        .setCustomId('restart')
                                                        .setLabel('🔄 Restart')
                                                        .setStyle('Primary')
                                                        .setDisabled(true),
                                                )
                                                .addComponents(
                                                    new Discord.ButtonBuilder()
                                                        .setCustomId('stop')
                                                        .setLabel('🔴 Stop')
                                                        .setStyle('Danger')
                                                        .setDisabled(true),
                                                )
                                                .addComponents(
                                                    new Discord.ButtonBuilder()
                                                        .setLabel('🔗 Link')
                                                        .setURL(`https://panel.luxxy.cloud/server/${server}`)
                                                        .setStyle('Link'),
                                                )
                                        ]
                                    });
                                });
                            }).catch(err => {
                                if (err == 'Error: Request failed with status code 504') {
                                    msg.edit({
                                        embeds: [
                                            new Discord.EmbedBuilder()
                                                .setTitle(':x: | ' + err)
                                                .setDescription("The server's node wings or the server might be offline, so I could not access the server")
                                                .setColor(Discord.Colors.Red)
                                        ]
                                    });
                                } else {
                                    msg.edit({
                                        embeds: [
                                            new Discord.EmbedBuilder()
                                                .setTitle(':x: | ' + err)
                                                .setColor(Discord.Colors.Red)
                                        ]
                                    });
                                }
                            });
                        }).catch(error => {
                            console.log(error + '');
                            if (error == 'Error: Request failed with status code 404') {
                                msg.edit({
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setTitle(':x: | The server was not found')
                                            .setColor(Discord.Colors.Red)
                                    ]
                                });
                            } else if (error == 'Error: Request failed with status code 403') {
                                msg.edit({
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setTitle(':x: | You are not the owner')
                                            .setColor(Discord.Colors.Red)
                                            .setDescription('If you are the owner of this server, that means that the API key that you gave to the bot is invalid.\n `sv!config` for remaking the configuration')
                               ] });
                            } else {
                                msg.edit({
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                            .setTitle(':x: | ERROR')
                                            .setColor(Discord.Colors.Red)
                                            .setDescription('.\n' + error)
                               ] });
                            }
                        });
                    } else {
                        msg.edit(':x: | Sorry, but I didn\'t find that server in your list!');
                    }
                }
            }, 2000);
        }).catch(err => {
            msg.edit(':x: | ' + err);
        });
    });
};
