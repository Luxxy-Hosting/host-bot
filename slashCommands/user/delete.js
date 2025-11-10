const { SlashCommandBuilder } = require('discord.js');
const runLegacyCommand = require('../../utils/runLegacyCommand');
const legacyCommand = require('../../commands/user/delete.js');

const data = new SlashCommandBuilder()
    .setName('user-delete')
    .setDescription('Delete (unlink) your Luxxy account');

module.exports = {
    data,
    name: data.name,
    category: 'user',
    ownerOnly: false,
    run: async (client, interaction) => {
        const args = ['delete'];
        await runLegacyCommand(interaction, legacyCommand, args, { ephemeral: false });
    },
};
