const { default: axios } = require('axios')
const Discord = require('discord.js')
const moment = require('moment')
const config = require('../../config.json')
module.exports = async (client, message, args) => {
         /// disabled for now because issue with linking owners account
        if(!message.member.roles.cache.has(config.roleID.administrator)) return message.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('You do not have the required permissions to use this command!')
            ]
        })
        if (!args[1]) return message.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('usage: !staff link @luxxy <consoleid>')
            ]
        })
        const user1 = message.mentions.users.first()
        if(!user1) return message.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('You need to specify a user to link!')
            ]
        })
        const consoleid = args[2]
        if(!consoleid) return message.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle('Error')
                .setDescription('You need to specify a console ID!')
            ]
        })

        if (args[2] == 1 && message.author.id !== '517107022399799331') {
                 message.reply({
                          embeds: [
                                   new Discord.MessageEmbed()
                                   .setColor('#ff0000')
                                   .setTitle('Error')
                                   .setDescription(`${error} You cannot link this user to this consoleID!`)
                          ]
                 })
            return;
        }
        axios({
            url: config.pterodactyl.host + "/api/application/users/" + consoleid,
            method: 'get',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then(async user => {
            userData.set(user1.id, {
                discordID: user1.id,
                consoleID: consoleid,
                email: user.data.attributes.email,
                username: user.data.attributes.username,
                linkTime: moment().format("HH:mm:ss"),
                linkDate: moment().format("YYYY-MM-DD"),
            })
            message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setColor('#00ff00')
                    .setTitle('Success')
                    .setDescription('User linked successfully! \n Username: ' + user.data.attributes.username + '\n Email: ' + user.data.attributes.email + '\n Console ID: ' + consoleid)
                    ]
                })
            })
    }
