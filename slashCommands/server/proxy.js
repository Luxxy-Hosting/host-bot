const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/server/proxy.js');

const data = new SlashCommandBuilder()
    .setName('server-proxy')
    .setDescription('Proxy your server behind a custom domain (deprecated)')
    .addStringOption(option =>
        option
            .setName('server_id')
            .setDescription('Server identifier (short ID)')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('domain')
            .setDescription('Domain to proxy (example.com)')
            .setRequired(true)
    );

module.exports = {
    data,
    name: data.name,
    category: 'server',
    ownerOnly: false,
    run: async (client, interaction) => {
        const serverId = interaction.options.getString('server_id', true);
        const domain = interaction.options.getString('domain', true);
        const args = ['proxy', serverId, domain];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
