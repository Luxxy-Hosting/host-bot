const Discord = require("discord.js");
const axios = require('axios')

module.exports = {
    name: "stealemoji",
    category: "Owner",
    description: "nah",
    run: async (client, message, args) => {
        if (!message.member.permissions.has(Discord.PermissionsBitField.Flags.Administrator)) return message.channel.send("No, You don't have permission to use this command")

        let emoji = args[0];
        let name = args.slice(1).join(" ");

        if (!emoji) {
            return message.reply('Please provide an emoji 💀')
        }

        if (!name) {
            return message.reply('Please specify emoji name')
        }

        if (emoji.startsWith('<') && emoji.endsWith('>')) {
            const id = emoji.match(/\d{15,}/g)[0];

            const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`)
            .then(image => {
                if (image) return "gif"
                else return "png"
            }).catch(err => {
                return "png"
            })

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`
        }

        if (emoji.startsWith('<a') && emoji.endsWith('>')) {
            const id = emoji.match(/\d{15,}/g)[0];

            const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.png`)
            .then(image => {
                if (image) return "png"
                else return "gif"
            }).catch(err => {
                return "gif"
            })

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`
        }

        if (!emoji.startsWith("https")) {
            return await message.reply({ content: "you can't steal this emoji" })
        }
        if (!emoji.startsWith("http")) {
            return await message.reply({ content: "you can't steal this emoji" })
        }


        message.guild.emojis.create({ attachment: `${emoji}`, name: `${name}` })
        .then(emoji => {
           const embed = new Discord.EmbedBuilder()
           .setColor('Aqua')
           .setDescription(`Successfully Added ${emoji}, with then name **${name}**`)

           return message.reply({ embeds: [embed] })
        }).catch(err => {
            message.reply({ content: `💀 probs no slots to fill ${err}` })
        })

    }
}