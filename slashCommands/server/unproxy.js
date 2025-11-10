const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/server/unproxy.js');

const data = new SlashCommandBuilder()
    .setName('server-unproxy')
    .setDescription('Remove a proxied domain from your server (deprecated)')
    .addStringOption(option =>
        option
            .setName('domain')
            .setDescription('Domain to unproxy (example.com)')
            .setRequired(true)
    );

module.exports = {
    data,
    name: data.name,
    category: 'server',
    ownerOnly: false,
    run: async (client, interaction) => {
        const domain = interaction.options.getString('domain', true);
        const args = ['unproxy', domain];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
