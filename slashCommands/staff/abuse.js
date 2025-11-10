const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/staff/abuse.js');

const data = new SlashCommandBuilder()
    .setName('staff-abuse')
    .setDescription('Flag a server for abuse review')
    .addStringOption(option =>
        option
            .setName('server_id')
            .setDescription('Server identifier (short ID)')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('reason')
            .setDescription('Reason for the abuse flag')
            .setRequired(false)
    );

module.exports = {
    data,
    name: data.name,
    category: 'staff',
    ownerOnly: false,
    run: async (client, interaction) => {
        const serverId = interaction.options.getString('server_id', true);
        const reason = interaction.options.getString('reason') || '';

        const args = ['abuse', serverId];
        if (reason) args.push(reason);

        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
