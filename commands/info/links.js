const Discord = require('discord.js')
module.exports = {
    name: "links",
    aliases: ['link'], 
    async run(client, message, args){
       const embed = new Discord.EmbedBuilder()
        .setColor(client.embedColor)
        .addFields({ name: 'Panel', value: '[Link](https://panel.luxxy.host)'})
        .addFields({ name: 'Website', value: '[Link](https://luxxy.host)'})
        .addFields({ name: 'Discord', value: '[Link](https://discord.gg/luxxy)'})
        .addFields({ name: 'Github', value: '[Link](https://github.com/luxxy-hosting)'})
        message.reply({ embeds: [embed] })

    }
}