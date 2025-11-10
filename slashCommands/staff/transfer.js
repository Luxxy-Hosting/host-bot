const { SlashCommandBuilder } = require('discord.js');

const data = new SlashCommandBuilder()
    .setName('staff-transfer')
    .setDescription('Transfer command placeholder (not implemented)');

module.exports = {
    data,
    name: data.name,
    category: 'staff',
    ownerOnly: false,
    run: async (client, interaction) => {
        await interaction.reply({
            content: 'This transfer command is not implemented yet.',
            ephemeral: true,
        });
    },
};
