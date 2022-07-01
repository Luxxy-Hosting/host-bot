const Discord = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');
const userData = require('../../models/userData');

module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.support)) return message.channel.send('You do not have the required permissions to use this command.');
    const user = await message.mentions.users.first()
    if (!user) return message.reply({ 
        embeds: [
            new Discord.MessageEmbed()
            .setTitle(`:x: | You need to mention a user`)
            .setColor(`RED`)
        ]
    })
    const userDB = await userData.findOne({ ID: user.id });
    if (!userDB) return message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setTitle(`:x: | ${user.username} doesn't have an account yet`)
            .setColor(`RED`)
        ]
    })
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
        responce = response.data.attributes.relationships.servers.data
        let id = 1
        let id2 = 1
        if (responce.length <= 35) {
            message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setTitle(`${user.username}'s servers`)
                    .addField('Server Id:', `\`\`\`\n${responce.map(x => `${id++}. ${x.attributes.identifier}`).join('\n')}\`\`\``, true)
                    .addField('Server Name:',`\`\`\`\n${responce.map(x => `${id2++}. ${x.attributes.name}`).join('\n')}\`\`\``, true)
                    .setColor(`GREEN`)
                ]
            }).catch(err => {
                message.reply({
                    embeds: [
                        new Discord.MessageEmbed()
                        .setTitle(`:x: | HOW MANY SERVERS DO U HAVE???`)
                        .setDescription(`${err}`)
                        .setColor(`RED`)
                    ]
                })
            }
            )
        }
    })
}