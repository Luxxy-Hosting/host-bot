const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/staff/proxyfix.js');

const data = new SlashCommandBuilder()
    .setName('staff-proxyfix')
    .setDescription('Force-remove a proxied domain record')
    .addStringOption(option =>
        option
            .setName('domain')
            .setDescription('Domain to remove')
            .setRequired(true)
    );

module.exports = {
    data,
    name: data.name,
    category: 'staff',
    ownerOnly: false,
    run: async (client, interaction) => {
        const domain = interaction.options.getString('domain', true);
        const args = ['proxyfix', domain];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
