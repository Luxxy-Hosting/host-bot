const { ContainerBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const { C, V2 } = require('../../helpers/components');

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
    const container = new ContainerBuilder()
        .setAccentColor(C.Blurple)
        .addTextDisplayComponents(td => td.setContent(`## 📊 ${user.username}'s Server Count`))
        .addSeparatorComponents(sep => sep.setDivider(true))
        .addTextDisplayComponents(td => td.setContent(
            `**Gameservers:** \`${usage.gameused}/${usage.gamehave}\`\n` +
            `**Bot Servers:** \`${usage.botused}/${usage.bothave}\``
        ));

    message.channel.send({ components: [container], ...V2 });
};
