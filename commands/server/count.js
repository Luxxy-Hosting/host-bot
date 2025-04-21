const Discord = require('discord.js')

module.exports = async (client, message, args) => {
    const user = message.mentions.users.first() || message.author;
    if (!serverCount.get(user.id)) {
        await serverCount.set(user.id, {
            gameused: 0,
            botused: 0,
            gamehave: 1,
            bothave: 2
        });
    }

    const usage = serverCount.get(user.id);
    message.channel.send({
        embeds: [
            new Discord.EmbedBuilder()
                .setTitle(`${success} ${user.username}'s Server Count`)
                .setColor(0x677bf9)
                .setDescription(`**${user.username}**\nGameservers: \`${usage.gameused}/${usage.gamehave}\`\nBot Servers: \`${usage.botused}/${usage.bothave}\``)
        ]
    });
};
