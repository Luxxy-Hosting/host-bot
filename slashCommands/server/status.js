const Discord = require("discord.js");
const axios = require("axios");
const config = require("../../config.json");
const userdata = require("../../models/userData");

module.exports = {
    name: "status",
    category: "info",
    description: "shows your status of your server can control it",
    ownerOnly: false,
    options: [{
        name: "serverid",
        description: "The id of the server you want to control",
        type: "STRING",
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
        }).then(async res => {
            const preoutput = response.data.attributes.relationships.servers.data
            const output = preoutput.find(srv => srv.attributes ? srv.attributes.identifier == server : false)

            setTimeout(async () => {
                if (!output) {
                    interaction.reply({
                        embeds: [
                            new Discord.MessageEmbed()
                            .setTitle(`:x: | Server not found`)
                            .setDescription(`The server with the id ${serverid} was not found`)
                            .setColor(`RED`)
                        ]
                    })
                } else {
                    if (output.attributes.user = userDB.consoleID) {
                        axios({
                            url: config.pterodactyl.host + '/api/client/servers/' + server ,
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
                                url: config.pterodactyl.host + '/api/client/servers/' + server + "/resources",
                                method: 'GET',
                                followRedirect: true,
                                maxRedirects: 5,
                                headers: {
                                    'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                    'Content-Type': 'application/json',
                                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                                }
                            }).then(async resources => {
                                let getUptime = (originalTime) => {
                                    let filanresult// = format(originalUptime)
                                    let array = format(originalUptime).split(':')
                                    let length = array.length
                                    filanresult = `${array[length - 4] ? `${array[length - 4]}d ` : ""}${array[length - 3] ? `${array[length - 3]}h ` : ""}${array[length - 2] ? `${array[length - 2]}m ` : ""}${array[length - 1] ? `${array[length - 1]}s` : ""}`

                                    return filanresult;
                                }

                                let srvname = response.data.attributes.name

                                interaction.reply({
                                    embeds: [
                                        new Discord.MessageEmbed()
                                        .setTitle(`Your Server Status`)
                                                    .setColor(`${resources.data.attributes.current_state == 'running' ? 'GREEN' : resources.data.attributes.current_state == 'offline' ? 'RED' : "YELLOW"}`)
                                                    .setDescription(`**Status:** \`${resources.data.attributes.current_state == 'running' ? '🟢 Running' : resources.data.attributes.current_state == 'offline' ? '🔴 Offline' : "🔄" + resources.data.attributes.current_state}\`\n`
                                                    + `**Name:** \`${srvname}\`\n`
                                                    + `**Uptime:** \`${getUptime(resources.data.attributes.resources.uptime)}\`\n`
                                                    + `**Cpu:** \`${resources.data.attributes.resources.cpu_absolute}%\`\n`
                                                    + `**Ram:** \`${pretty(resources.data.attributes.resources.memory_bytes)}\`\n`
                                                    + `**Disk:** \`${pretty(resources.data.attributes.resources.disk_bytes)}\`\n`
                                                    + `**Net:** \`⬆️${pretty(resources.data.attributes.resources.network_tx_bytes)}/${pretty(resources.data.attributes.resources.network_rx_bytes)}⬇️\`\n`
                                                    + `**Node:** \`${response.data.attributes.node}\`\n`
                                                    + `**Full Id:** \`${response.data.attributes.uuid}\`\n`)
                                    ]
                                })
                            })
                        })
                    }
                }
            })
        })
    }
}