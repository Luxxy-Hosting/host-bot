const { default: axios } = require('axios');
const Discord = require('discord.js');
const config = require('../../config.json');
const moment = require('moment');
const userData = require('../../models/userData');
const db = require('quick.db')
const wait = require('node:timers/promises').setTimeout;
const chalk = require('chalk')
const oldUserData = new db.table("userData");
module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.admin)) return message.channel.send('You do not have the required permissions to use this command.');
message.guild.members.cache.forEach(member => {
            setTimeout(() => {
            const oldUserDB = oldUserData.get(member.user.id)
            const userDB = userData.findOne({ ID: member.user.id });
            if (oldUserDB) {
                if (userDB) {
                return;
                }
        axios({
            url: config.pterodactyl.host + "/api/application/users/" + oldUserDB.consoleID,
            method: 'get',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then(async user => {
                client.channels.cache.get('992171639750017024').send({
                    embeds: [
                        new Discord.MessageEmbed()
                        .setColor('#00ff00')
                        .setTitle('Success')
                        .setDescription('User is already in new db \n Username: ' + user.data.attributes.username + '\n Email: ' + user.data.attributes.email + '\n Console ID: ' + userDB.consoleID)
                    ]
                })
                })
                return;
            }
            if (!oldUserDB) {
                client.channels.cache.get('992171639750017024').send({
                    embeds: [
                        new Discord.MessageEmbed()
                        .setColor('#00ff00')
                        .setTitle('Success')
                        .setDescription('User has no account in quickdb database')
                    ]
                })
                return;
            }
        axios({
            url: config.pterodactyl.host + "/api/application/users/" + oldUserDB.consoleID,
            method: 'get',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then(async user => {
            userData({
                ID: message.author.id,
                consoleID: oldUserDB.consoleID,
                email: oldUserDB.email,
                username: user.data.attributes.username,
                linkTime: moment().format("HH:mm:ss"),
                linkDate: moment().format("YYYY-MM-DD"),
            }).save()
            client.channels.cache.get('992171639750017024').send({
                embeds: [
                    new Discord.MessageEmbed()
                    .setColor('#00ff00')
                    .setTitle('Success')
                    .setDescription('User linked successfully! \n Username: ' + user.data.attributes.username + '\n Email: ' + user.data.attributes.email + '\n Console ID: ' + oldUserDB.consoleID)
                ]
            })
           }).catch(err => client.channels.cache.get('992171639750017024').send({content: `this was not post to happen ${err}`}))
         }, 5000)
        })
}
