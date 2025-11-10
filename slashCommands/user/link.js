const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/user/link.js');

const data = new SlashCommandBuilder()
    .setName('user-link')
    .setDescription('Show your linked account information');

module.exports = {
    data,
    name: data.name,
    category: 'user',
    ownerOnly: false,
    run: async (client, interaction) => {
        const args = ['link'];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
