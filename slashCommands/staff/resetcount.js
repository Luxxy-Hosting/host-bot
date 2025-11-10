const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/staff/resetcount.js');

const data = new SlashCommandBuilder()
    .setName('staff-resetcount')
    .setDescription('Reset a user’s server count')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('User whose count you want to reset')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option
            .setName('slots')
            .setDescription('Slots to set after the reset')
            .setRequired(true)
    );

module.exports = {
    data,
    name: data.name,
    category: 'staff',
    ownerOnly: false,
    run: async (client, interaction) => {
        const targetUser = interaction.options.getUser('user', true);
        const targetMember = interaction.options.getMember('user');
        const slots = interaction.options.getInteger('slots', true);

        const args = ['resetcount', targetUser.id, String(slots)];
        await runLegacyCommand(interaction, legacyCommand, args, {
            mentionUsers: [targetUser],
            mentionMembers: targetMember ? [targetMember] : [],
        });
    },
};
