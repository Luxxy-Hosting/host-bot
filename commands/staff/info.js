const Discord = require('discord.js');
const config = require('../../config.json');
const axios = require('axios');
module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.support)) return message.channel.send('You do not have the required permissions to use this command.');
    const user = await message.mentions.users.first() || message.author;

    if (!userData.get(user.id)) return message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setTitle(`:x: | ${user.username} doesn't have an account yet`)
            .setColor(`RED`)
        ]
    })
    axios({
        url: config.pterodactyl.host + "/api/application/users/" + userData.get(user.id).consoleID + "?include=servers",
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
            url: config.pterodactyl.host + "/api/application/users/" + userData.get(user.id).consoleID,
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
                    .addField('Console ID', `\`\`\`\n${userData.get(user.id).consoleID}\`\`\``, true)
                    .addField('Email', `\`\`\`\n${res.data.attributes.email}\`\`\``, true)
                    .addField('Username', `\`\`\`\n${res.data.attributes.username}\`\`\``, true)
                    .addField('Link Date', `\`\`\`\n${userData.get(user.id).linkDate}\`\`\``, true)
                    .addField('Link Time', `\`\`\`\n${userData.get(user.id).linkTime}\`\`\``, true)
                    .addField('Servers', `\`\`\`\n${responce.map(x => `${id++}. ${x.attributes.identifier}`).join('\n')}\`\`\``, true)
                    .addField('Servers Name', `\`\`\`\n${responce.map(x => `${id2++}. ${x.attributes.name}`).join('\n')}\`\`\``, true)
                    .addField('Server Count', `\`\`\`\n${serverCount.get(user.id).used} / ${serverCount.get(user.id).have}\`\`\``, true)
                    .setColor(`GREEN`)
                ]
            }).then(wtfisthisbruhayyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy => {
                setTimeout(() => {
                    wtfisthisbruhayyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy.delete({ timeout: 10000 });
                }, 10000);
            })
        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    })
}