const Discord = require('discord.js');
const config = require('../../config.json');
const axios = require('axios');
const userData = require('../../models/userData');
module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.support)) return message.channel.send('You do not have the required permissions to use this command.');
    const user = await message.mentions.users.first() || message.author;
    const userDB = await userData.findOne({ ID: user.id });
    const servercount = serverCount.get(user.id);
    if (!userDB) return message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setTitle(`:x: | ${user.username} doesn't have an account yet`)
            .setColor(`RED`)
        ]
    })
    if (!servercount) return message.reply({
        embeds: [
            new Discord.MessageEmbed()
             .setTitle(`user don't have server count`)
    ]})
    axios({
        url: config.pterodactyl.host + "/api/application/users/" + userDB.consoleID + "?include=servers",
        method: 'GET',
        followRedirect: true,
        maxRedirects: 5,
        headers: {

            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'Application/vnd.pterodactyl.v1+json',
        },
    }).then(async response => {
        responce = response.data.attributes.relationships.servers.data;
        let id = 1;
        let id2 = 1;
        axios({
            url: config.pterodactyl.host + "/api/application/users/" + userDB.consoleID,
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then(async res => {
            message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setTitle(`${user.username}'s Info`)
                    .addField('Console ID', `\`\`\`\n${userDB.consoleID}\`\`\``, true)
                    .addField('Email', `\`\`\`\n${res.data.attributes.email}\`\`\``, true)
                    .addField('Username', `\`\`\`\n${res.data.attributes.username}\`\`\``, true)
                    .addField('Link Date', `\`\`\`\n${userDB.linkDate}\`\`\``, true)
                    .addField('Link Time', `\`\`\`\n${userDB.linkTime}\`\`\``, true)
                    .addField('Servers', `\`\`\`\n${responce.map(x => `${id++}. ${x.attributes.identifier}`).join('\n')}\`\`\``, true)
                    .addField('Servers Name', `\`\`\`\n${responce.map(x => `${id2++}. ${x.attributes.name}`).join('\n')}\`\`\``, true)
                    .addField('Server Count', `\`\`\`\n${serverCount.get(user.id).used} / ${serverCount.get(user.id).have}\`\`\``, true)
                    .setColor(`GREEN`)
                ]
            })
        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    })
}