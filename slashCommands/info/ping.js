const Discord = require("discord.js");

module.exports = {
    name: "ping",
    category: "info",
    description: "Shows the bot's latency",
    ownerOnly: false,
    run: async (client, interaction, args) => {
        var ping = Date.now() - interaction.createdTimestamp;
        const embed = new Discord.MessageEmbed()
            .setColor("#0099ff")
            .setDescription(`Latency: **${ping}**ms \nAPI Latency: **${Math.round(client.ws.ping)}**ms`)
            .setTimestamp();
        interaction.reply({ embeds: [embed] });
    }
}