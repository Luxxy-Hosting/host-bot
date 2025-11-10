const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/server/invite.js');

const data = new SlashCommandBuilder()
    .setName('server-invite')
    .setDescription('Invite a user to access one of your servers')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('User to invite')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('server_id')
            .setDescription('Server identifier (short ID)')
            .setRequired(true)
    );

module.exports = {
    data,
    name: data.name,
    category: 'server',
    ownerOnly: false,
    run: async (client, interaction) => {
        const targetUser = interaction.options.getUser('user', true);
        const targetMember = interaction.options.getMember('user');
        const serverId = interaction.options.getString('server_id', true);

        const args = ['invite', targetUser.id, serverId];
        await runLegacyCommand(interaction, legacyCommand, args, {
            mentionUsers: [targetUser],
            mentionMembers: targetMember ? [targetMember] : [],
        });
    },
};
