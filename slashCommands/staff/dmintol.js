const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/staff/dmintol.js');

const data = new SlashCommandBuilder()
    .setName('staff-dmintol')
    .setDescription('DM Intol with a message')
    .addStringOption(option =>
        option
            .setName('message')
            .setDescription('Message to send')
            .setRequired(true)
    );

module.exports = {
    data,
    name: data.name,
    category: 'staff',
    ownerOnly: false,
    run: async (client, interaction) => {
        const content = interaction.options.getString('message', true);
        const args = ['dmintol', content];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
