const Discord = require('discord.js');
const axios = require('axios');
const userData = require('../../models/userData');
const config = require('../../config.json');

module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id })
    if (!userDB) {
        message.reply(`${error} You dont have an account created. type \`${config.bot.prefix}user new\` to create one \n Note: we moving account to different database what means you have to do \`${config.bot.prefix}user switchdbs\` to switch and get the bot working for you`);
        return;
    }
    const user = message.mentions.users.first() || client.users.cache.get(args[1]) || message.author;
    if (!user) return message.reply(`${error} Please mention a user or provide a user id`);
    let serverid = args[2]
    if (!serverid) return message.reply(`${error} What server should i delete? please provide you server id *(${config.bot.prefix}server invite user <serverid>)*`)

    const inviteuserdb = await userData.findOne({ ID: user.id })
    if (!inviteuserdb) {
        message.reply(`${error} That user does not have an account created. type \`${config.bot.prefix}user new\` to create one \n Note: we moving account to different database what means you have to do \`${config.bot.prefix}user switchdbs\` to switch and get the bot working for you`);
        return;
    }

    let msg = await message.channel.send('Let me check if this is your server, please wait . . .')
    console.log(userDB.consoleID)
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
        const output = await preoutput.find(srv => srv.attributes ? srv.attributes.identifier == serverid : false)

        if(!output) return msg.edit(`:x: I could not find that server`)
        if (!output.attributes.user === userDB.consoleID) return msg.edit(`:x: You are not the owner of this server`)

        msg.edit({
            content: `Are you sure you want to invite \`${user.username}\` to \`${output.attributes.name}\`?`,
            components:[
                new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('AcceptInvite')
                        .setLabel('Yes')
                        .setStyle('SUCCESS'),
                )
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('RejectInvite')
                        .setLabel('No')
                        .setStyle('DANGER'),
                )
            ]
        })

        const filter = i => i.user.id === message.author.id;
        const Collector = msg.createMessageComponentCollector({ filter, time: 300000 });

        Collector.on('collect', async i => {
            i.deferUpdate()
            Collector.stop()
            if(i.customId === "AcceptInvite") {
                msg.edit({
                    content: `Inviting ${user.username} to ${output.attributes.name}`,
                })
                const data = {
                    "email": inviteuserdb.email,
                    "permissions": [
                        "control.console",
                        "control.start",
                        "control.stop",
                        "control.restart",
                        "file.create",
                        "file.read",
                        "file.update",
                        "file.delete",
                        "file.archive",
                        "file.sftp",
                        "backup.create",
                        "backup.read",
                        "backup.delete",
                        "backup.update",
                        "backup.download",
                        "allocation.update",
                        "startup.update",
                        "startup.read",
                        "database.create",
                        "database.read",
                        "database.update",
                        "database.delete",
                        "database.view_password",
                        "schedule.create",
                        "schedule.read",
                        "schedule.update",
                        "settings.rename",
                        "schedule.delete",
                        "websocket.connect"
                    ]
                }
                console.log(output.attributes.identifier)
                axios({
                    url: config.pterodactyl.host + "/api/client/servers/" + output.attributes.identifier + "/users",
                    method: 'POST',
                    followRedirect: true,
                    maxRedirects: 5,
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                    },
                    data: data
                }).then(async response => {
                    msg.edit(`${user.username} has been invited to ${output.attributes.name}`)
                }).catch(err => {
                    msg.edit(`${error} ${err}`)
                })

            }
            if(i.customId === "RejectInvite") {
                msg.edit({
                    content: `Invite rejected`,
                })
            }
        })

        Collector.on('end',() => {
            msg.edit({components:[]})
        })
    }).catch(err => {
        msg.edit(`Error: ${err}`)
    })
}