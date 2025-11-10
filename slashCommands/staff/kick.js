const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/staff/kick.js');

const data = new SlashCommandBuilder()
    .setName('staff-kick')
    .setDescription('Kick a user from the guild (staff only)')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('User to kick')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('reason')
            .setDescription('Kick reason')
            .setRequired(false)
    );

module.exports = {
    data,
    name: data.name,
    category: 'staff',
    ownerOnly: false,
    run: async (client, interaction) => {
        const targetUser = interaction.options.getUser('user', true);
        const targetMember = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason') || '';

        const args = ['kick', targetUser.id];
        if (reason) args.push(reason);

        await runLegacyCommand(interaction, legacyCommand, args, {
            mentionUsers: [targetUser],
            mentionMembers: targetMember ? [targetMember] : [],
        });
    },
};
