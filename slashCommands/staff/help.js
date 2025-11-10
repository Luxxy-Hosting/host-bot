const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/staff/help.js');

const data = new SlashCommandBuilder()
    .setName('staff-help')
    .setDescription('List available staff commands');

module.exports = {
    data,
    name: data.name,
    category: 'staff',
    ownerOnly: false,
    run: async (client, interaction) => {
        const args = ['help'];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
