const { ContainerBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require("discord.js");
const { C, V2, errorMsg, successMsg, infoMsg } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    const user = message.mentions.users.first() || message.guild.members.cache.get(args[1]);

    if (!user) {
        return message.channel.send({ components: [infoMsg('Missing User', 'Please mention a user or provide a user ID.')], ...V2 });
    }

    const count = serverCount.get(user.id);

    if (!count) {
        return message.channel.send({ components: [errorMsg('Not Found', 'This user has never been counted.')], ...V2 });
    }

    const number = args[2];

    if (!number) {
        return message.channel.send({ components: [errorMsg('Missing Number', 'Please provide a number.')], ...V2 });
    }

    const container = new ContainerBuilder()
        .setAccentColor(C.Warning)
        .addTextDisplayComponents(td => td.setContent(`## ⚠️ Reset Count`))
        .addSeparatorComponents(sep => sep.setDivider(true))
        .addTextDisplayComponents(td => td.setContent(`Are you sure you want to reset **${user.tag}**'s count to \`${number}\`?`))
        .addActionRowComponents(row =>
            row.addComponents(
                new ButtonBuilder().setCustomId('AcceptDelete').setLabel('Yes').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('RejectDelete').setLabel('No').setStyle(ButtonStyle.Danger)
            )
        );

    const msg = await message.channel.send({ components: [container], ...V2 });
    
    const filter = i => i.user.id === message.author.id;
    const Collector = msg.createMessageComponentCollector({ filter, time: 300000 });
    
    Collector.on('collect', async i => {
        i.deferUpdate();
        Collector.stop();
        if (i.customId === "AcceptDelete") {
            serverCount.set(user.id, {
                gameused: 0,
                botused: 0,
                gamehave: 1,
                bothave: 2
            });
            msg.edit({ components: [successMsg('Count Reset', `**${user.tag}**'s count reset successfully!`)], ...V2 });
        }
        if (i.customId === "RejectDelete") {
            msg.edit({ components: [errorMsg('Cancelled', 'Count reset cancelled.')], ...V2 });
        }
    });

    Collector.on('end', () => {
        msg.edit({ components: msg.components }).catch(() => {});
    });
};