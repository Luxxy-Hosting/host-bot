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
            new Discord.EmbedBuilder()
            .setTitle(`:x: | ${user.username} doesn't have an account yet`)
            .setColor(Discord.Colors.Red)
        ]
    })
    if (!servercount) return message.reply({
        embeds: [
            new Discord.EmbedBuilder()
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
                    new Discord.EmbedBuilder()
                    .setTitle(`${user.username}'s Info`)
                    .addFields({ name: 'Console ID', value: `\`\`\`\n${userDB.consoleID}\`\`\``, inline: true })
                    .addFields({ name: 'Email', value:  `\`\`\`\n${res.data.attributes.email}\`\`\``, inline: true })
                    .addFields({ name: 'Username', value:  `\`\`\`\n${res.data.attributes.username}\`\`\``, inline: true })
                    .addFields({ name: 'Link Date', value:  `\`\`\`\n${userDB.linkDate}\`\`\``, inline: true})
                    .addFields({ name:'Link Time', value: `\`\`\`\n${userDB.linkTime}\`\`\``, inline: true})
                    .addFields({ name: 'Servers', value:  `\`\`\`\n${responce.map(x => `${id++}. ${x.attributes.identifier}`).join('\n')}\`\`\``, inline: true})
                    .addFields({ name: 'Servers Name', value:  `\`\`\`\n${responce.map(x => `${id2++}. ${x.attributes.name}`).join('\n')}\`\`\``, inline: true})
                    .addFields({ name: 'Server Count', value: `\`\`\`\n${serverCount.get(user.id).used} / ${serverCount.get(user.id).have}\`\`\``, inline: true})
                    .setColor(Discord.Colors.Green)
                ]
            })
        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    })
}