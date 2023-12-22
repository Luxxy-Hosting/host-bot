const Discord = require("discord.js");
const axios = require('axios')

module.exports = {
    name: "random",
    category: "Owner",
    description: "nah",
    aliases: ['r'],
    run: async (client, message, args) => {

        if (message.channel.nsfw === true) {
            axios.get('https://api.luxxy.host/api/random?key=fl-5s94ed').then(e => {
                const embed = new Discord.EmbedBuilder()
                .setImage(e.data.image)
                .setColor(Discord.Colors.Aqua)
            message.reply({ embeds: [embed] })
            }).catch(err => message.reply('not working at this time'))
        } else return message.reply("not nsfw channel")

    }
}