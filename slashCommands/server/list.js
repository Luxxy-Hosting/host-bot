const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/server/list.js');

const data = new SlashCommandBuilder()
    .setName('server-list')
    .setDescription('List all servers linked to your account');

module.exports = {
    data,
    name: data.name,
    category: 'server',
    ownerOnly: false,
    run: async (client, interaction) => {
        const args = ['list'];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
