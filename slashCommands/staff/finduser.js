const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/staff/finduser.js');

const data = new SlashCommandBuilder()
    .setName('staff-finduser')
    .setDescription('Find a user by their panel email')
    .addStringOption(option =>
        option
            .setName('email')
            .setDescription('Email address to search for')
            .setRequired(true)
    );

module.exports = {
    data,
    name: data.name,
    category: 'staff',
    ownerOnly: false,
    run: async (client, interaction) => {
        const email = interaction.options.getString('email', true);
        const args = ['finduser', email];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
