const Discord = require("discord.js");
const config = require("../../config.json");

module.exports = {
    name: "help",
    category: "info",
    description: "Shows all available commands",
    options: [
        {
            name: "category",
            description: "Show commands from a specific category",
            type: Discord.ApplicationCommandOptionType.String,
            required: false,
            choices: [
                { name: "User Commands", value: "user" },
                { name: "Server Commands", value: "server" },
                { name: "Info Commands", value: "info" },
                { name: "Music Commands", value: "music" },
                { name: "Admin Commands", value: "admin" },
            ],
        }
    ],
    ownerOnly: false,
    run: async (client, interaction) => {
        const category = interaction.options.getString('category');

        if (category) {
            // Show specific category
            const commands = client.slash.filter(cmd => cmd.category === category);
            
            if (commands.size === 0) {
                return interaction.reply(`No commands found in the **${category}** category.`);
            }

            const embed = new Discord.EmbedBuilder()
                .setTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} Commands`)
                .setColor(client.embedColor)
                .setDescription(commands.map(cmd => `\`/${cmd.name}\` - ${cmd.description}`).join('\n'))
                .setFooter({ text: `Use /help to see all categories` })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } else {
            // Show all categories
            const categories = [...new Set(client.slash.map(cmd => cmd.category))];
            
            const embed = new Discord.EmbedBuilder()
                .setTitle('🤖 Luxxy Hosting Bot Commands')
                .setColor(client.embedColor)
                .setDescription('Here are all available command categories:')
                .setThumbnail(client.user.displayAvatarURL())
                .setTimestamp();

            for (const cat of categories) {
                const commands = client.slash.filter(cmd => cmd.category === cat);
                embed.addFields({
                    name: `${cat.charAt(0).toUpperCase() + cat.slice(1)} (${commands.size})`,
                    value: commands.map(cmd => `\`/${cmd.name}\``).join(', ') || 'No commands',
                    inline: false
                });
            }

            embed.addFields({
                name: '🔗 Useful Links',
                value: `[Panel](${config.pterodactyl.host}) | [Discord Server](https://discord.gg/luxxy) | [Website](https://luxxyhosting.com)`,
                inline: false
            });

            embed.setFooter({ text: 'Use /help <category> to see specific commands' });

            await interaction.reply({ embeds: [embed] });
        }
    }
}