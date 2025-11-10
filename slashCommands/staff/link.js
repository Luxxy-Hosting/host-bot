const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/staff/link.js');

const data = new SlashCommandBuilder()
    .setName('staff-link')
    .setDescription('Link a Discord user to a Pterodactyl console ID')
    .addUserOption(option =>
        option
            .setName('user')
            .setDescription('Discord user to link')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('console_id')
            .setDescription('Pterodactyl console ID')
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
        const consoleId = interaction.options.getString('console_id', true);

        const args = ['link', targetUser.id, consoleId];

        await runLegacyCommand(interaction, legacyCommand, args, {
            mentionUsers: [targetUser],
            mentionMembers: targetMember ? [targetMember] : [],
        });
    },
};
