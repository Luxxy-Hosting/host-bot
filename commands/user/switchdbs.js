const db = require('quick.db')
const { default: axios } = require('axios')
const Discord = require('discord.js')
const moment = require('moment')
const config = require('../../config.json')
const userData = require('../../models/userData');
const oldUserData = new db.table("userData");

module.exports = async (client, message, args) => {
	const oldUserDB = oldUserData.get(message.author.id)
	const userDB = await userData.findOne({ ID: message.author.id });
    if (!oldUserDB) {
        message.reply(error + ` somehow you never had account on the old db \n you can create account by doing \n **${config.bot.prefix}user new**`)
        return;
    }
    if (userDB) {
        message.reply(error + " You already have a `panel account` linked");
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
            message.reply({
                embeds: [
                    new Discord.MessageEmbed()
                    .setColor('#00ff00')
                    .setTitle('Success')
                    .setDescription('User linked successfully! \n Username: ' + user.data.attributes.username + '\n Email: ' + user.data.attributes.email + '\n Console ID: ' + oldUserDB.consoleid)
                    ]
                })
            }).catch(err => message.reply('this was not post to happen' + err))
    message.reply(`${success} Database succcessfully transfered to Mongodb database.`)
}
