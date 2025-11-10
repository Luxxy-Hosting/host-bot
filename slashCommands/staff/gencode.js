const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/staff/gencode.js');

const data = new SlashCommandBuilder()
    .setName('staff-gencode')
    .setDescription('Generate a redeem code (currently disabled)')
    .addStringOption(option =>
        option
            .setName('name')
            .setDescription('Code label')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option
            .setName('servers')
            .setDescription('Number of servers granted')
            .setMinValue(1)
            .setRequired(true)
    );

module.exports = {
    data,
    name: data.name,
    category: 'staff',
    ownerOnly: false,
    run: async (client, interaction) => {
        const name = interaction.options.getString('name', true);
        const amount = interaction.options.getInteger('servers', true);
        const args = ['gencode', name, String(amount)];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
