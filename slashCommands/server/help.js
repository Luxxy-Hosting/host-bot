const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/server/help.js');

const data = new SlashCommandBuilder()
    .setName('server-help')
    .setDescription('Show available /server commands');

module.exports = {
    data,
    name: data.name,
    category: 'server',
    ownerOnly: false,
    run: async (client, interaction) => {
        const args = ['help'];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
