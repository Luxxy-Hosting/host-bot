const Discord = require('discord.js')
const config = require('../../config.json')
module.exports = {
    name: "help",
    aliases: [''], 
    async run(client, message, args){
        message.reply({embeds:[
            new Discord.MessageEmbed()
            .setTitle(`❓ | Need help?`)
            .setColor(`#677bf9`)
            .addField(`**Pterodactyl commands:**`, `${config.bot.prefix}user\n${config.bot.prefix}server`, true)
            .addField(`**Info:**`, `${config.bot.prefix}ping\n${config.bot.prefix}invites\n${config.bot.prefix}help`, true)
        ]})
    }
}
