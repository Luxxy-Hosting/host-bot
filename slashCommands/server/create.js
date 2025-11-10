const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/server/create.js');

const data = new SlashCommandBuilder()
    .setName('server-create')
    .setDescription('Create a free hosting server')
    .addStringOption(option =>
        option
            .setName('type')
            .setDescription('Server type (e.g. paper, nodejs) or `list` to view options')
            .setRequired(false)
    )
    .addStringOption(option =>
        option
            .setName('name')
            .setDescription('Server name (optional, defaults to the type)')
            .setRequired(false)
    );

module.exports = {
    data,
    name: data.name,
    category: 'server',
    ownerOnly: false,
    run: async (client, interaction) => {
        const type = interaction.options.getString('type');
        const name = interaction.options.getString('name');

        const args = ['create'];
        if (type) args.push(type);
        if (name) args.push(name);

        await runLegacyCommand(interaction, legacyCommand, args);
    },
};
