const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/server/redeem.js');

const data = new SlashCommandBuilder()
    .setName('server-redeem')
    .setDescription('Redeem a server code (if available)')
    .addStringOption(option =>
        option
            .setName('code')
            .setDescription('Redeemable code')
            .setRequired(true)
    );

module.exports = {
    data,
    name: data.name,
    category: 'server',
    ownerOnly: false,
    run: async (client, interaction) => {
        const code = interaction.options.getString('code', true);
        const args = ['redeem', code];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
