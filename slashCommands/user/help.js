const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/user/help.js');

const data = new SlashCommandBuilder()
    .setName('user-help')
    .setDescription('Show all /user commands');

module.exports = {
    data,
    name: data.name,
    category: 'user',
    ownerOnly: false,
    run: async (client, interaction) => {
        const args = ['help'];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
