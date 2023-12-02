const Discord = require("discord.js");
const { NekoBot } = require("nekobot-api");
const api = new NekoBot();

module.exports = {
    name: "gif",
    category: "Owner",
    description: "nah",
    aliases: ['pgif'],
    run: async (client, message, args) => {

        if (message.channel.nsfw === true) {

            const nsfw = await api.get("pgif")

            const embed = new Discord.EmbedBuilder()
            .setImage(nsfw)

            message.reply({ embeds: [embed] }).catch(err => message.reply('error'))
        } else return message.reply("not nsfw channel")

    }
}