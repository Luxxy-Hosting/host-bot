const Discord = require('discord.js')
module.exports = {
    name: "links",
    aliases: ['link'], 
    async run(client, message, args){
       const embed = new Discord.MessageEmbed()
        .setColor(client.embedColor)
        .setAuthor(`${message.author.username}`, message.member.displayAvatarURL({ dynamic: true }))
        .addField('Panel', '[Link](https://panel.luxxy.host)')
        .addField('Website', '[Link](https://luxxy.host)')
        .addField('Discord', '[Link](https://discord.gg/luxxy)')
        .addField('Github', '[Link](https://github.com/luxxy-hosting)')
        message.reply({ embeds: [embed] })

    }
}