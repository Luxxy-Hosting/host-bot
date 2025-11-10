const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/user/password.js');

const data = new SlashCommandBuilder()
    .setName('user-password')
    .setDescription('Reset your panel password');

module.exports = {
    data,
    name: data.name,
    category: 'user',
    ownerOnly: false,
    run: async (client, interaction) => {
        const args = ['password'];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
