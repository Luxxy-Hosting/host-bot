const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/server/renew.js');

const data = new SlashCommandBuilder()
    .setName('server-renew')
    .setDescription('Renew an expiring server (available within 24h of expiry)')
    .addStringOption(option =>
        option
            .setName('server_id')
            .setDescription('Server identifier to renew')
            .setRequired(true)
    );

module.exports = {
    data,
    name: data.name,
    category: 'server',
    ownerOnly: false,
    run: async (client, interaction) => {
        const serverId = interaction.options.getString('server_id', true);
        const args = ['renew', serverId];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
