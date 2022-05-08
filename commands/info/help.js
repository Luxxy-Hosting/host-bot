const Discord = require('discord.js')
module.exports = {
    name: "help",
    aliases: [''], 
    async run(client, message, args){
        message.reply({embeds:[
            new Discord.MessageEmbed()
            .setTitle(`❓ | Need help?`)
            .setColor(`#677bf9`)
            .addField(`**Pterodactyl commands:**`, `!user\n!server`, true)
            .addField(`**Info:**`, `!ping\n!invites\n!help`, true)
        ]})
    }
}