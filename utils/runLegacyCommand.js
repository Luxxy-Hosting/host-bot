const { Collection } = require('discord.js');

/**
 * Bridges an interaction-based slash command to an existing message command implementation.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {Function} legacyHandler - The legacy message command module (client, message, args)
 * @param {Array<string>} args - Arguments array expected by the legacy handler
 * @param {Object} [options]
 * @param {Array<import('discord.js').User>} [options.mentionUsers=[]]
 * @param {Array<import('discord.js').GuildMember>} [options.mentionMembers=[]]
 * @param {boolean} [options.ephemeral=false]
 */
module.exports = async function runLegacyCommand(interaction, legacyHandler, args = [], options = {}) {
    const { mentionUsers = [], mentionMembers = [], ephemeral = false } = options;

    if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral });
    }

    let replied = interaction.replied;

    const send = async (payload) => {
        const data = typeof payload === 'string' ? { content: payload } : { ...payload };
        if (data.fetchReply === undefined) data.fetchReply = true;

        if (!replied) {
            replied = true;
            return interaction.editReply(data);
        }

        return interaction.followUp(data);
    };

    const baseChannel = interaction.channel;
    let channelClone;
    if (baseChannel) {
        channelClone = Object.assign(Object.create(Object.getPrototypeOf(baseChannel)), baseChannel);
    } else {
        channelClone = { id: interaction.channelId };
    }
    channelClone.send = send;

    const message = {
        client: interaction.client,
        author: interaction.user,
        member: interaction.member,
        guild: interaction.guild,
        channel: channelClone,
        reply: send,
        delete: () => Promise.resolve(),
        content: `/${interaction.commandName}`,
        createdTimestamp: Date.now(),
    };

    const usersCollection = new Collection();
    mentionUsers.filter(Boolean).forEach(user => usersCollection.set(user.id, user));

    const membersCollection = new Collection();
    mentionMembers.filter(Boolean).forEach(member => membersCollection.set(member.id, member));

    message.mentions = {
        users: usersCollection,
        members: membersCollection,
    };

    return legacyHandler(interaction.client, message, args);
};
