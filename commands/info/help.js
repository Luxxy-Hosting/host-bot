const Discord = require('discord.js')
module.exports = {
    name: "help",
    aliases: [''], 
    async run(client, message, args){
        message.reply({embeds:[
            new Discord.EmbedBuilder()
            .setTitle(`❓ | Need help?`)
            .setColor(0x677bf9)
            .addFields({ name: `**Pterodactyl commands:**`, value: `!user\n!server`, inline: true})
            .addFields({ name: `**Info:**`, value: `!ping\n!invites\n!help`, inline: true})
        ]})
    }
}