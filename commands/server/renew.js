const config = require('../../config.json');
const Discord = require('discord.js');
const ServerData = require('../../models/serverData');

module.exports = async (client, message, args) => {
    const userId = message.author.id;
    const prefix = config.bot.prefix || '!';
    const errorEmoji = config.emojis?.error || '❌';
    const successEmoji = config.emojis?.success || '✅';
    const warningEmoji = config.emojis?.warning || '⚠️';
    const waitingEmoji = config.emojis?.waiting || '⏳';
    const unauthorizedEmoji = config.emojis?.unauthorized || '🚫';
    const infoEmoji = config.emojis?.info || 'ℹ️';

    if (!args[1]) {
        const usageEmbed = new Discord.EmbedBuilder()
            .setColor(Discord.Colors.Blue)
            .setTitle(`${infoEmoji} Command Usage: ${prefix}renew`)
            .setDescription(`Please provide the required arguments, including the Server ID as the second argument.\n\nExample format might be: \`${prefix}renew <some_value> <YOUR_SERVER_ID>\`\nCheck required format or use \`${prefix}server list\` to find IDs.`);
        return message.reply({ embeds: [usageEmbed] });
    }

    const serverIdToRenew = args[1];

    try {
        const server = await ServerData.findOne({ serverID: serverIdToRenew });

        if (!server) {
            const notFoundEmbed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Red)
                .setDescription(`${errorEmoji} Error: Could not find any server data with the ID \`${Discord.escapeMarkdown(serverIdToRenew)}\` (provided as the second argument).\nPlease verify the ID with \`${prefix}server list\`.`);
            return message.reply({ embeds: [notFoundEmbed] });
        }

        if (server.ownerID !== userId && server.serverAdminID !== userId) {
            const unauthorizedEmbed = new Discord.EmbedBuilder()
               .setColor(Discord.Colors.Orange)
               .setDescription(`${unauthorizedEmoji} Authorization Error: You are not the owner or designated admin for the server with ID \`${Discord.escapeMarkdown(server.serverID)}\`.`);
           return message.reply({ embeds: [unauthorizedEmbed] });
        }

        const now = new Date();
        if (server.expiresAt <= now) {
             const expiredEmbed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Yellow)
                .setDescription(`${warningEmoji} Already Expired: The server **${Discord.escapeMarkdown(server.serverName)}** (ID: \`${server.serverID}\`) has already expired. Renewal via this command is not possible.`);
             return message.reply({ embeds: [expiredEmbed] });
        }

        const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;
        const timeRemaining = server.expiresAt.getTime() - now.getTime();

        if (timeRemaining > twentyFourHoursInMillis) {
             const renewalAvailableDate = new Date(server.expiresAt.getTime() - twentyFourHoursInMillis);
             const renewalAvailableTimestamp = Math.floor(renewalAvailableDate.getTime() / 1000);

             const tooEarlyEmbed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Blue)
                .setDescription(
                    `${waitingEmoji} Too Early: Renewal for server **${Discord.escapeMarkdown(server.serverName)}** (ID: \`${server.serverID}\`) is not yet available.\n` +
                    `Renewal will be possible after <t:${renewalAvailableTimestamp}:F> (<t:${renewalAvailableTimestamp}:R>).`
                );
             return message.reply({ embeds: [tooEarlyEmbed] });
        }

        if (!server.warned) {
             const notWarnedEmbed = new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Blue)
                .setDescription(`${waitingEmoji} Not Ready: Renewal for server **${Discord.escapeMarkdown(server.serverName)}** (ID: \`${server.serverID}\`) is not enabled yet. Please wait for the 24-hour expiration warning notification for this server.`);
             return message.reply({ embeds: [notWarnedEmbed] });
        }

        const newExpiresAt = new Date(server.expiresAt.getTime() + 7 * twentyFourHoursInMillis);
        const newExpiresAtTimestamp = Math.floor(newExpiresAt.getTime() / 1000);

        server.expiresAt = newExpiresAt;
        server.warned = false;
        await server.save();

        const successEmbed = new Discord.EmbedBuilder()
            .setColor(Discord.Colors.Green)
            .setTitle(`${successEmoji} Server Renewed Successfully!`)
            .setDescription(`The server **${Discord.escapeMarkdown(server.serverName)}** (ID: \`${server.serverID}\`) has been renewed for another 7 days.`)
            .addFields(
                { name: 'New Expiration Date', value: `<t:${newExpiresAtTimestamp}:F> (<t:${newExpiresAtTimestamp}:R>)`, inline: true },
                { name: 'Renewed By', value: message.author.tag, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Server ID: ${server.serverID}` });

        return message.reply({ embeds: [successEmbed] });

    } catch (error) {
        console.error(`Error executing renew command for server ID ${serverIdToRenew || 'N/A'}:`, error);
        const errorEmbed = new Discord.EmbedBuilder()
             .setColor(Discord.Colors.Red)
             .setTitle(`${errorEmoji} Command Error`)
             .setDescription(`🆘 An unexpected error occurred while trying to renew server ID \`${Discord.escapeMarkdown(serverIdToRenew || 'N/A')}\`. Please report this to the bot developer.`);
        try {
            await message.reply({ embeds: [errorEmbed] });
        } catch (e) {
            console.error("Failed to send error reply:", e);
        }
    }
};