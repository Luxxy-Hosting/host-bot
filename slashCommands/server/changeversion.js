const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/server/changeversion.js');

const data = new SlashCommandBuilder()
    .setName('server-changeversion')
    .setDescription('Change the Minecraft version of one of your servers')
    .addStringOption(option =>
        option
            .setName('server_id')
            .setDescription('Server identifier (short ID)')
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('version')
            .setDescription('Target Minecraft version (e.g. 1.20.2)')
            .setRequired(true)
    );

module.exports = {
    data,
    name: data.name,
    category: 'server',
    ownerOnly: false,
    run: async (client, interaction) => {
        const serverId = interaction.options.getString('server_id');
        const version = interaction.options.getString('version');
        const args = ['changeversion', serverId, version];
        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
