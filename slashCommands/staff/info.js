const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/staff/info.js');

const data = new SlashCommandBuilder()
    .setName('staff-info')
    .setDescription('View linked account info for a user')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('User to inspect (defaults to yourself)')
            .setRequired(false)
    );

module.exports = {
    data,
    name: data.name,
    category: 'staff',
    ownerOnly: false,
    run: async (client, interaction) => {
        const targetUser = interaction.options.getUser('user');
        const targetMember = interaction.options.getMember('user');
        const args = ['info'];
        await runLegacyCommand(interaction, legacyCommand, args, {
            mentionUsers: targetUser ? [targetUser] : [],
            mentionMembers: targetMember ? [targetMember] : [],
        });
    },
};
