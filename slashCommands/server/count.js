const Discord = require('discord.js');

module.exports = {
    name: "count",
    category: "server",
    description: "Show your server count and usage",
    options: [
        {
            name: "user",
            description: "User to check (optional)",
            type: Discord.ApplicationCommandOptionType.User,
            required: false,
        }
    ],
    ownerOnly: false,
    run: async (client, interaction) => {
        const user = interaction.options.getUser('user') || interaction.user;
        
        if (!global.serverCount.get(user.id)) {
            await global.serverCount.set(user.id, {
                gameused: 0,
                botused: 0,
                gamehave: 1,
                bothave: 2
            });
        }

        const usage = global.serverCount.get(user.id);
        await interaction.reply({
            embeds: [
                new Discord.EmbedBuilder()
                    .setTitle(`${global.success} ${user.username}'s Server Count`)
                    .setColor(0x677bf9)
                    .setDescription(`**${user.username}**\nGameservers: \`${usage.gameused}/${usage.gamehave}\`\nBot Servers: \`${usage.botused}/${usage.bothave}\``)
            ]
        });
    }
}