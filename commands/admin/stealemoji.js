const { ContainerBuilder, MessageFlags } = require("discord.js");
const axios = require('axios');
const { C, V2, errorMsg, successMsg, infoMsg } = require('../../helpers/components');

module.exports = {
    name: "stealemoji",
    category: "Owner",
    description: "nah",
    run: async (client, message, args) => {
        if (!message.member.permissions.has(8n)) return message.channel.send({ components: [errorMsg('No Permission', `You don't have permission to use this command.`)], ...V2 });

        let emoji = args[0];
        let name = args.slice(1).join(" ");

        if (!emoji) {
            return message.reply({ components: [infoMsg('Missing Emoji', 'Please provide an emoji 💀')], ...V2 });
        }

        if (!name) {
            return message.reply({ components: [infoMsg('Missing Name', 'Please specify emoji name')], ...V2 });
        }

        if (emoji.startsWith('<') && emoji.endsWith('>')) {
            const id = emoji.match(/\d{15,}/g)[0];

            const type = await axios.get(`https://cdn.discordapp.com/emojis/${id}.gif`)
            .then(image => {
                if (image) return "gif"
                else return "png"
            }).catch(err => {
                return "png"
            });

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
            });

            emoji = `https://cdn.discordapp.com/emojis/${id}.${type}?quality=lossless`
        }

        if (!emoji.startsWith("https") && !emoji.startsWith("http")) {
            return await message.reply({ components: [errorMsg('Invalid Emoji', "You can't steal this emoji.")], ...V2 });
        }

        message.guild.emojis.create({ attachment: `${emoji}`, name: `${name}` })
        .then(emoji => {
           message.reply({
               components: [successMsg('Emoji Added', `Successfully added ${emoji} with the name **${name}**`)],
               ...V2
           });
        }).catch(err => {
            message.reply({ components: [errorMsg('Failed', `💀 Probably no slots to fill or another error:\n${err}`)], ...V2 });
        });
    }
};