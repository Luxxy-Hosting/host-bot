const Discord = require('discord.js')
const axios = require('axios')
const userData = require('../../models/userData');
const config = require ('../../config.json')
module.exports = async (client, message, args) => {
    return message.reply('in development')
    const userDB = await userData.findOne({ ID: message.author.id })
    if (!userDB) {
        message.reply(`${error} You dont have an account created. type \`${config.bot.prefix}user new\` to create one`);
        return;
    }

    const serverid = args[1]

    const version = args[2]
    

    if (!serverid) {
        return message.reply('<a:catcrazy:957592929902395422> where the server id find it by doing !server list')
    }
    if (args[1].match(/[0-9a-z]+/i) == null)
    
    return message.channel.send("lol only use english characters.");

    if (!version === "1.8.8") {
        return message.reply('this is not a vaild verison')
    }
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

        if(!output) return msg.edit(`:x: I could not find that server`)
        if (!output.attributes.user === userDB.consoleID) return msg.edit(`:x: You are not the owner of this server`)

        msg.edit({
            content: `Note: ** this will delete all the files for **  \`${output.attributes.name}\`? `,
            components:[
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
    })
    const filter = i => i.user.id === message.author.id;
        const Collector = msg.createMessageComponentCollector({ filter, time: 300000 });

        Collector.on('collect', async i => {
            i.deferUpdate()
            Collector.stop()
            if(i.customId === "AcceptDelete") {
                msg.edit({
                    content: `Reinstalling Server \n Please wait . . .`,
                })

                axios({
                    url: config.pterodactyl.host + "/api/client/servers/" + serverid + "/files/delete",
                    method: 'POST',
                    followRedirect: true,
                    maxRedirects: 5,
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                    },
                    data: {
                        "root": "/",
                        "files": [
                            "cache",
                            "config",
                            "libraries",
                            "logs",
                            "plugins",
                            "versions",
                            "world",
                            "world_nether",
                            "world_the_end",
                            "whitelist.json",
                            "version_history.json",
                            "usercache.json",
                            "spigot.yml",
                            "server.properties",
                            "server.jar",
                            "purpur.yml",
                            "paper.yml",
                            "pufferfish.yml",
                            "permissions.yml",
                            "ops.json",
                            "help.yml",
                            "eula.txt",
                            "commands.yml",
                            "bukkit.yml",
                            "banned-players.json",
                            "banned-ips.json"
                        ],
                    }
                }).then(() => {
                    axios({
                        url: config.pterodactyl.host + "/api/client/servers/" + serverid + "/startup/variable",
                        method: 'PUT',
                        followRedirect: true,
                        maxRedirects: 5,
                        headers: {
                            'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                            'Content-Type': 'application/json',
                            'Accept': 'Application/vnd.pterodactyl.v1+json',
                        },
                        data: {
                            "key": "MINECRAFT_VERSION",
                            "value": version
                        }
                    }).then(() => {
                        axios({
                            url: config.pterodactyl.host + "/api/client/servers/" + serverid + "/settings/reinstall",
                            method: 'POST',
                            followRedirect: true,
                            maxRedirects: 5,
                            headers: {
                                'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                'Content-Type': 'application/json',
                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                            },
                        }).then(e => {
                            msg.edit(`<a:imdone:976448151386996787>`)
                        }).catch(err => {
                            msg.edit(`bruh: ${err}`)
                        })
                    }).catch(err => {
                        msg.edit(`BROKE: ${err}`)
                    })
                    msg.edit(`${success} Server Reinstalled!`)
                }).catch(err => {
                    msg.edit(`Error: ${err}`)
                })
            }
            if(i.customId === "RejectDelete") {
                msg.edit({
                    content: `waaa`,
                })
            }
        })

        Collector.on('end',() => {
            msg.edit({components:[]})
        })
}