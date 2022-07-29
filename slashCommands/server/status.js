const Discord = require("discord.js");
const axios = require("axios");
const config = require("../../config.json");
const userdata = require("../../models/userData");
const pretty = require('prettysize');
const format = require('format-duration')

module.exports = {
    name: "status",
    category: "info",
    description: "shows your status of your server can control it",
    ownerOnly: false,
    options: [{
        name: "serverid",
        description: "The id of the server you want to control",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
    }],
    run: async (client, interaction, args) => {
        const userDB = await userdata.findOne({ ID: interaction.user.id });
        if (!userDB) {
            interaction.reply({ content: 'You Don\'t have an account created. type `!user new` to create one' });
            return;
        }

        const serverid = interaction.options.getString('serverid');

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
        }).then(async response => {
            const preoutput = response.data.attributes.relationships.servers.data
            const output = preoutput.find(srv => srv.attributes ? srv.attributes.identifier == serverid : false)

            setTimeout(async () => {
                if (!output) {
                    interaction.reply({
                        embeds: [
                            new Discord.EmbedBuilder()
                            .setTitle(`:x: | Server not found`)
                            .setDescription(`The server with the id ${serverid} was not found`)
                            .setColor(Discord.Colors.Red)
                        ]
                    })
                } else {
                    if (output.attributes.user = userDB.consoleID) {
                        axios({
                            url: config.pterodactyl.host + '/api/client/servers/' + serverid ,
                            method: 'GET',
                            followRedirect: true,
                            maxRedirects: 5,
                            headers: {
                                'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                'Content-Type': 'application/json',
                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                            }
                        }).then(async response => {
                            axios({
                                url: config.pterodactyl.host + '/api/client/servers/' + serverid + "/resources",
                                method: 'GET',
                                followRedirect: true,
                                maxRedirects: 5,
                                headers: {
                                    'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                    'Content-Type': 'application/json',
                                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                                }
                            }).then(async resources => {
                                let getUptime = (originalUptime) => {
                                    let filanresult// = format(originalUptime)
                                    let array = format(originalUptime).split(':')
                                    let length = array.length
                                    filanresult = `${array[length - 4] ? `${array[length - 4]}d ` : ""}${array[length - 3] ? `${array[length - 3]}h ` : ""}${array[length - 2] ? `${array[length - 2]}m ` : ""}${array[length - 1] ? `${array[length - 1]}s` : ""}`

                                    return filanresult;
                                }

                                let srvname = response.data.attributes.name

                                interaction.reply({
                                    embeds: [
                                        new Discord.EmbedBuilder()
                                        .setTitle(`Your Server Status`)
                                                    //.setColor(`${resources.data.attributes.current_state == 'running' ? `${Discord.Colors.Green}` : resources.data.attributes.current_state == 'offline' ? `${Discord.Colors.Red}` : `${Discord.Colors.Yellow}`}`)
                                                    .setDescription(`**Status:** \`${resources.data.attributes.current_state == 'running' ? '🟢 Running' : resources.data.attributes.current_state == 'offline' ? '🔴 Offline' : "🔄" + resources.data.attributes.current_state}\`\n`
                                                    + `**Name:** \`${srvname}\`\n`
                                                    + `**Uptime:** \`${getUptime(resources.data.attributes.resources.uptime)}\`\n`
                                                    + `**Cpu:** \`${resources.data.attributes.resources.cpu_absolute}%\`\n`
                                                    + `**Ram:** \`${pretty(resources.data.attributes.resources.memory_bytes)}\`\n`
                                                    + `**Disk:** \`${pretty(resources.data.attributes.resources.disk_bytes)}\`\n`
                                                    + `**Net:** \`⬆️${pretty(resources.data.attributes.resources.network_tx_bytes)}/${pretty(resources.data.attributes.resources.network_rx_bytes)}⬇️\`\n`
                                                    + `**Node:** \`${response.data.attributes.node}\`\n`
                                                    + `**Full Id:** \`${response.data.attributes.uuid}\`\n`)
                                    ], components:[
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
                                            .setURL(`${config.pterodactyl.host}/server/${serverid}`)
                                            .setStyle('Link'),
                                        )
                                        ]
                                })
                                const filter = m => m.user.id === interaction.user.id;
                                const collector = interaction.channel.createMessageCollector(filter, { time: 60000 });
                                collector.on('collect', m => {
                                    if (m.customId ==='start') {
                                        axios({
                                            url: config.pterodactyl.host + '/api/client/servers/' + serverid + '/start',
                                            method: 'POST',
                                            followRedirect: true,
                                            maxRedirects: 5,
                                            headers: {
                                                'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                                'Content-Type': 'application/json',
                                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                                            }
                                        }).then(async response => {
                                            interaction.channel.send({
                                                embeds: [
                                                    new Discord.MessageEmbed()
                                                    .setTitle(`:white_check_mark: | Server started`)
                                                    .setDescription(`The server with the id ${serverid} has been started`)
                                                    .setColor(`GREEN`)
                                                ]
                                            })
                                        }).catch(async error => {
                                            interaction.channel.send({
                                                embeds: [
                                                    new Discord.MessageEmbed()
                                                    .setTitle(`:x: | Error`)
                                                    .setDescription(`The server with the id ${serverid} could not be started`)
                                                    .setColor(`RED`)
                                                ]
                                            })
                                        })
                                    } else if (m.customId ==='restart') {
                                        axios({
                                            url: config.pterodactyl.host + '/api/client/servers/' + serverid + '/restart',
                                            method: 'POST',
                                            followRedirect: true,
                                            maxRedirects: 5,
                                            headers: {
                                                'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                                'Content-Type': 'application/json',
                                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                                            }
                                        }).then(async response => {
                                            interaction.channel.send({
                                                embeds: [
                                                    new Discord.MessageEmbed()
                                                    .setTitle(`:white_check_mark: | Server restarted`)
                                                    .setDescription(`The server with the id ${serverid} has been restarted`)
                                                    .setColor(`GREEN`)
                                                ]
                                            })
                                        }
                                        ).catch(async error => {
                                            interaction.channel.send({
                                                embeds: [
                                                    new Discord.MessageEmbed()
                                                    .setTitle(`:x: | Error`)
                                                    .setDescription(`The server with the id ${serverid} could not be restarted`)
                                                    .setColor(`RED`)
                                                ]
                                            })
                                        }
                                        )
                                    } else if (m.customId ==='stop') {
                                        axios({
                                            url: config.pterodactyl.host + '/api/client/servers/' + serverid + '/stop',
                                            method: 'POST',
                                            followRedirect: true,
                                            maxRedirects: 5,
                                            headers: {
                                                'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                                'Content-Type': 'application/json',
                                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                                            }
                                        }).then(async response => {
                                            interaction.channel.send({
                                                embeds: [
                                                    new Discord.MessageEmbed()
                                                    .setTitle(`:white_check_mark: | Server stopped`)
                                                    .setDescription(`The server with the id ${serverid} has been stopped`)
                                                    .setColor(`GREEN`)
                                                ]
                                            })
                                        }
                                        ).catch(async error => {
                                            interaction.channel.send({
                                                embeds: [
                                                    new Discord.MessageEmbed()
                                                    .setTitle(`:x: | Error`)
                                                    .setDescription(`The server with the id ${serverid} could not be stopped`)
                                                    .setColor(`RED`)
                                                ]
                                            })
                                        }
                                        )
                                    }
                                }
                                )
                                collector.on('end', collected => {
                                    interaction.channel.send({
                                        embeds: [
                                            new Discord.MessageEmbed()
                                            .setTitle(`:x: | Error`)
                                            .setDescription(`The server with the id ${serverid} could not be started`)
                                            .setColor(`RED`)
                                        ]
                                    })
                                }
                                )
                            })
                        })
                    }
                }
            })
        })
    }
}