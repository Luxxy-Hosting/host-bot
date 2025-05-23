const config = require('../../config.json')
const Discord = require('discord.js');
const axios = require('axios');
const userData = require('../../models/userData');
const serverData = require('../../models/serverData');
module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id })
    if (!userDB) {
        message.reply(`${error} You dont have an account created. type \`${config.bot.prefix}user new\` to create one`);
        return;
    }
    if (!args[1]) return message.reply(`${error} What server should i delete? please provide you server id *(${config.bot.prefix}server delete <server id>)*`)
    if (args[1].match(/[0-9a-z]+/i) == null)
        return message.channel.send("lol only use english characters.");

    args[1] = args[1].split('-')[0];

    let msg = await message.channel.send('Let me check if this is your server, please wait . . .')
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
        const output = await preoutput.find(srv => srv.attributes ? srv.attributes.identifier == args[1] : false)

        if (!output) return msg.edit(`:x: I could not find that server`)
        if (!output.attributes.user === userDB.consoleID) return msg.edit(`:x: You are not the owner of this server`)

        msg.edit({
            content: `Are you sure you want to delete \`${output.attributes.name}\`? once you delete your server you will never be able to recover it and all data and files will be lost forever!`,
            components: [
                new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('AcceptDelete')
                            .setLabel('Yes')
                            .setStyle('Success'),
                    )
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('RejectDelete')
                            .setLabel('No')
                            .setStyle('Danger'),
                    )
            ]
        })

        const filter = i => i.user.id === message.author.id;
        const Collector = msg.createMessageComponentCollector({ filter, time: 300000 });

        Collector.on('collect', async i => {
            i.deferUpdate()
            Collector.stop()
            if (i.customId === "AcceptDelete") {
                msg.edit({
                    content: `Deleting Server \n Please wait . . .`,
                })

                axios({
                    url: config.pterodactyl.host + "/api/application/servers/" + output.attributes.id,
                    method: 'get',
                    followRedirect: true,
                    maxRedirects: 5,
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                    }
                }).then(deleted => {
                    axios({
                        url: config.pterodactyl.host + "/api/application/servers/" + output.attributes.id + "/force",
                        method: 'DELETE',
                        followRedirect: true,
                        maxRedirects: 5,
                        headers: {
                            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                            'Content-Type': 'application/json',
                            'Accept': 'Application/vnd.pterodactyl.v1+json',
                        }
                    }).then(() => {
                        msg.edit(`${success} Server deleted!`)
                        if (!serverCount.get(message.author.id)) return msg.edit('WTF? how did u got a server?')
                        serverData.findOne({ serverAdminID: output.attributes.id }).then(async (data) => {
                            if (data) {
                                if (data.type === 'gameserver') {
                                    serverCount.subtract(message.author.id + '.gameused', 1)
                                    console.log('gameused')
                                } else if (data.type === 'botserver') {
                                    serverCount.subtract(message.author.id + '.botused', 1)
                                    console.log('botused')
                                }
                            }
                        }).then(() => { serverData.deleteOne({ serverAdminID: output.attributes.id }) }).catch(err => {
                            console.log(err)
                        })
                    }).catch(err => {
                        msg.edit(`Error: ${err}`)
                    })
                })


            }
            if (i.customId === "RejectDelete") {
                msg.edit({
                    content: `${success} Server deletion canceled`,
                })
            }
        })

        Collector.on('end', () => {
            msg.edit({ components: [] })
        })
    })
}