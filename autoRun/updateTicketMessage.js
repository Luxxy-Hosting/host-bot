const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, DiscordAPIError } = require('discord.js');
const config = require('../config.json');

module.exports = async (client) => {
    return;
    let channel = client.channels.cache.get(config.channelID.ticketChannel);

    if (!channel || channel.type !== ChannelType.GuildText) return;

    let msg = (await channel.messages.fetch({ limit: 10 }))?.last();

    let toSendEmbed = [
        new EmbedBuilder()
            .setTitle(`Interactions`)
            .setColor(`Aqua`)
            .setDescription(`📩 - Create a ticket\n💻 - Apply for volunteer developer\n👨‍💼 - Apply staff`)
    ];

    let ToSendComponents = [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('CreateTicket')
                .setEmoji('📩')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!config.settings.interactions.createTicket),

            new ButtonBuilder()
                .setCustomId('ApplyDeveloper')
                .setEmoji('💻')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!config.settings.interactions.developer),

            new ButtonBuilder()
                .setCustomId('ApplyStaff')
                .setEmoji('👨‍💼')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!config.settings.interactions.staff)
        )
    ];

    if (msg) {
        await msg.edit({ embeds: toSendEmbed, components: ToSendComponents });
    } else {
        await channel.send({ embeds: toSendEmbed, components: ToSendComponents });
    }
};
