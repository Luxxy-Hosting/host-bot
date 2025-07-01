const Discord = require('discord.js');
const config = require('../../config.json');
const db = require("quick.db");

module.exports = {
    name: "blacklist",
    category: "admin",
    description: "Blacklist or unblacklist a user from the bot",
    options: [
        {
            name: "action",
            description: "Add or remove from blacklist",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "Add", value: "add" },
                { name: "Remove", value: "remove" },
            ],
        },
        {
            name: "user",
            description: "User to blacklist/unblacklist",
            type: Discord.ApplicationCommandOptionType.User,
            required: true,
        }
    ],
    ownerOnly: true,
    run: async (client, interaction) => {
        const action = interaction.options.getString('action');
        const user = interaction.options.getUser('user');

        if (user.id === client.user.id) return interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor(Discord.Colors.Red).setDescription('You can\'t blacklist me')], ephemeral: true });
        if (user.id === interaction.user.id) return interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor(Discord.Colors.Red).setDescription('You can\'t blacklist yourself')], ephemeral: true });
        if (user.id === config.settings.owner) return interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor(Discord.Colors.Red).setDescription('You can\'t blacklist the owner')], ephemeral: true });
        if (user.bot) return interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor(Discord.Colors.Red).setDescription('You can\'t blacklist a bot')], ephemeral: true });

        if (action === "add") {
            let fetched = db.get(`blacklist_${user.id}`)
            if (!fetched) {
                db.set(`blacklist_${user.id}`, true)
                await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor(Discord.Colors.Green).setDescription(`${user.tag} has been blacklisted`)] });
            } else {
                return interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor(Discord.Colors.Yellow).setDescription(`${user.tag} is already blacklisted`)], ephemeral: true });
            }
        }

        if (action === "remove") {
            let fetched = db.get(`blacklist_${user.id}`)
            if (!fetched) {
                return interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor(Discord.Colors.Yellow).setDescription(`${user.tag} is not blacklisted`)], ephemeral: true });
            } else {
                db.delete(`blacklist_${user.id}`)
                await interaction.reply({ embeds: [new Discord.EmbedBuilder().setColor(Discord.Colors.Green).setDescription(`${user.tag} has been removed from the blacklist`)] });
            }
        }
    }
}