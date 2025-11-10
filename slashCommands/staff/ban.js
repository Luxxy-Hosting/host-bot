const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/staff/ban.js');

const data = new SlashCommandBuilder()
    .setName('staff-ban')
    .setDescription('Ban a user from the guild (staff only)')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('User to ban')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('reason')
            .setDescription('Ban reason')
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

        const args = ['ban', targetUser.id];
        if (reason) args.push(reason);

        await runLegacyCommand(interaction, legacyCommand, args, {
            mentionUsers: [targetUser],
            mentionMembers: targetMember ? [targetMember] : [],
        });
    },
};
