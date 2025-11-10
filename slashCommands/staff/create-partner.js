const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/staff/create-partner.js');

const data = new SlashCommandBuilder()
    .setName('staff-create-partner')
    .setDescription('Create a partner server for a user')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('User to grant a partner server')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option
            .setName('memory')
            .setDescription('Memory allocation in MB (4096-16384)')
            .setMinValue(4096)
            .setMaxValue(16432)
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
        const memory = interaction.options.getInteger('memory', true);

        const args = ['create-partner', targetUser.id, memory.toString()];

        await runLegacyCommand(interaction, legacyCommand, args, {
            mentionUsers: [targetUser],
            mentionMembers: targetMember ? [targetMember] : [],
        });
    },
};
