const Discord = require("discord.js");

module.exports = {
    name: "ping",
    category: "info",
    description: "Shows the bot's latency",
    type: Discord.ApplicationCommandType.ChatInput,
    ownerOnly: false,
    run: async (client, interaction, args) => {
        var ping = Date.now() - interaction.createdTimestamp;
        const embed = new Discord.EmbedBuilder()
            .setColor(0x0099ff)
            .setDescription(`Latency: **${ping}**ms \nAPI Latency: **${Math.round(client.ws.ping)}**ms`)
            .setTimestamp();
        interaction.reply({ embeds: [embed] });
    }
}