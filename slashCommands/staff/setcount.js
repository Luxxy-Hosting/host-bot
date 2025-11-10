const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/staff/setcount.js');

const data = new SlashCommandBuilder()
    .setName('staff-setcount')
    .setDescription('Set a user’s server slot count')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('Target user')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option
            .setName('slots')
            .setDescription('Number of slots to give')
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

        const args = ['setcount', targetUser.id, String(slots)];
        await runLegacyCommand(interaction, legacyCommand, args, {
            mentionUsers: [targetUser],
            mentionMembers: targetMember ? [targetMember] : [],
        });
    },
};
