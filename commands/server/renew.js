const config = require('../../config.json');
const { ContainerBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const ServerData = require('../../models/serverData');
const { C, V2, errorMsg, successMsg, warnMsg, infoMsg } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    const userId = message.author.id;
    const prefix = config.bot.prefix || '!';

    if (!args[1]) {
        return message.reply({ components: [infoMsg('Command Usage', `Please provide the Server ID.\n\`${prefix}renew <YOUR_SERVER_ID>\`\nUse \`${prefix}server list\` to find IDs.`)], ...V2 });
    }

    const serverIdToRenew = args[1];

    try {
        const server = await ServerData.findOne({ serverID: serverIdToRenew });

        if (!server) {
            return message.reply({ components: [errorMsg('Not Found', `Could not find server with ID \`${serverIdToRenew}\`.\nVerify with \`${prefix}server list\`.`)], ...V2 });
        }

        if (server.ownerID !== userId && server.serverAdminID !== userId) {
            return message.reply({ components: [errorMsg('Unauthorized', `You are not the owner or admin for server \`${server.serverID}\`.`)], ...V2 });
        }

        const now = new Date();
        if (server.expiresAt <= now) {
            return message.reply({ components: [warnMsg('Already Expired', `**${server.serverName}** (\`${server.serverID}\`) has already expired. Renewal is not possible.`)], ...V2 });
        }

        const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;
        const timeRemaining = server.expiresAt.getTime() - now.getTime();

        if (timeRemaining > twentyFourHoursInMillis) {
            const renewalAvailableDate = new Date(server.expiresAt.getTime() - twentyFourHoursInMillis);
            const renewalAvailableTimestamp = Math.floor(renewalAvailableDate.getTime() / 1000);

            return message.reply({
                components: [infoMsg('Too Early',
                    `Renewal for **${server.serverName}** (\`${server.serverID}\`) is not yet available.\n` +
                    `Renewal will be possible after <t:${renewalAvailableTimestamp}:F> (<t:${renewalAvailableTimestamp}:R>).`
                )],
                ...V2
            });
        }

        if (!server.warned) {
            return message.reply({ components: [infoMsg('Not Ready', `Please wait for the 24‑hour expiration warning for **${server.serverName}** (\`${server.serverID}\`).`)], ...V2 });
        }

        const newExpiresAt = new Date(server.expiresAt.getTime() + 7 * twentyFourHoursInMillis);
        const newExpiresAtTimestamp = Math.floor(newExpiresAt.getTime() / 1000);

        server.expiresAt = newExpiresAt;
        server.warned = false;
        await server.save();

        const container = new ContainerBuilder()
            .setAccentColor(C.Success)
            .addTextDisplayComponents(td => td.setContent(`## ✅ Server Renewed`))
            .addSeparatorComponents(sep => sep.setDivider(true))
            .addTextDisplayComponents(td => td.setContent(
                `**Server:** ${server.serverName} (\`${server.serverID}\`)\n` +
                `**New Expiry:** <t:${newExpiresAtTimestamp}:F> (<t:${newExpiresAtTimestamp}:R>)\n` +
                `**Renewed By:** ${message.author.tag}`
            ));

        return message.reply({ components: [container], ...V2 });

    } catch (error) {
        console.error(`Error executing renew command for server ID ${serverIdToRenew || 'N/A'}:`, error);
        try {
            await message.reply({ components: [errorMsg('Command Error', `An unexpected error occurred. Please report this.`)], ...V2 });
        } catch (e) {
            console.error("Failed to send error reply:", e);
        }
    }
};