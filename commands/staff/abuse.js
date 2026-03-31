const { ContainerBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');
const serverData = require('../../models/serverData');
const userData = require('../../models/userData');
const { C, V2, errorMsg, successMsg, warnMsg } = require('../../helpers/components');

const APPROVER_ROLE_ID = '941026456446828568';
const ABUSE_LOG_CHANNEL_ID = config.channelID?.abuse;
const PANEL_HEADERS = {
    'Authorization': `Bearer ${config.pterodactyl.adminApiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

const isAlphanumeric = value => /^[a-zA-Z0-9]+$/.test(value);

const formatError = (error) => {
    if (!error) return 'Unknown error';
    return error?.response?.data?.errors?.[0]?.detail
        || error?.response?.data?.message
        || error?.message
        || 'Unknown error';
};

module.exports = async (client, message, args) => {
    const hasStaffAccess =
        message.member.roles.cache.has(config.roleID.staff) ||
        message.member.roles.cache.has(config.roleID.support) ||
        message.member.roles.cache.has(config.roleID.admin);

    if (!hasStaffAccess) {
        return message.reply({ components: [errorMsg('No Permission', 'You do not have the required permissions to use this command.')], ...V2 });
    }

    const serverIdentifier = args[1]?.toLowerCase();
    if (!serverIdentifier) {
        return message.reply({ components: [errorMsg('Missing Identifier', `Usage: \`${config.bot.prefix}staff abuse <identifier> [reason]\``)], ...V2 });
    }

    if (!isAlphanumeric(serverIdentifier) || serverIdentifier.length < 4) {
        return message.reply({ components: [errorMsg('Invalid Identifier', 'Please provide a valid server identifier (example: `668568ff`).')], ...V2 });
    }

    const reasonInput = args.slice(2).join(' ').trim() || 'No reason provided.';
    const reason = reasonInput.length > 1000 ? `${reasonInput.slice(0, 997)}...` : reasonInput;

    const trackedServer = await serverData.findOne({ serverID: serverIdentifier });
    if (!trackedServer) {
        return message.reply({ components: [errorMsg('Not Found', `I couldn't find any tracked server with the ID \`${serverIdentifier}\`.`)], ...V2 });
    }

    const ownerMention = `<@${trackedServer.ownerID}>`;
    const ownerUser = await client.users.fetch(trackedServer.ownerID).catch(() => null);
    const ownerTag = ownerUser ? ownerUser.tag : 'Unknown user';
    const flagContext = {
        serverId: trackedServer.serverID,
        serverName: trackedServer.serverName,
        ownerId: trackedServer.ownerID,
        flaggedBy: message.author.id,
        reason,
    };

    const container = new ContainerBuilder()
        .setAccentColor(C.Warning)
        .addTextDisplayComponents(td => td.setContent(`## 🚨 Abuse Flag Created`))
        .addSeparatorComponents(sep => sep.setDivider(true))
        .addTextDisplayComponents(td => td.setContent(
            `A staff member reported an abusive server. An approver must review this request before we remove the user.\n\n` +
            `**Server Name:** \`${trackedServer.serverName}\`\n` +
            `**Server ID:** \`${trackedServer.serverID}\`\n` +
            `**Owner:** ${ownerMention} (\`${trackedServer.ownerID}\` — \`${ownerTag}\`)\n` +
            `**Flagged By:** <@${message.author.id}> (\`${message.author.id}\`)\n` +
            `**Reason:** ${reason}\n\n` +
            `**Status:** Pending approval`
        ));

    const approveId = buildCustomId('approve', trackedServer.serverID, trackedServer.ownerID);
    const rejectId = buildCustomId('reject', trackedServer.serverID, trackedServer.ownerID);
    
    container.addActionRowComponents(row =>
        row.addComponents(
            new ButtonBuilder().setCustomId(approveId).setLabel('Approve & Ban').setEmoji('🛑').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(rejectId).setLabel('Reject').setEmoji('✋').setStyle(ButtonStyle.Secondary)
        )
    );

    const reviewMessage = await message.reply({ components: [container], ...V2 });

    const collector = reviewMessage.createMessageComponentCollector({ componentType: 2 });

    collector.on('collect', async interaction => {
        if (![approveId, rejectId].includes(interaction.customId)) return;

        if (!interaction.member.roles.cache.has(APPROVER_ROLE_ID)) {
            return interaction.reply({ content: `Only members with <@&${APPROVER_ROLE_ID}> can approve this request.`, ephemeral: true });
        }

        const [, action, serverId, ownerId] = interaction.customId.split('|');
        const abuseReason = reason;

        if (action === 'approve') {
            collector.stop('approved');
            await interaction.deferReply({ ephemeral: true });

            const actionSummary = await handleApproval({
                serverId,
                ownerId,
                interaction,
                abuseReason,
            });

            const resolvedContainer = new ContainerBuilder()
                .setAccentColor(C.Error)
                .addTextDisplayComponents(td => td.setContent(`## 🚨 Abuse Flag Approved`))
                .addSeparatorComponents(sep => sep.setDivider(true))
                .addTextDisplayComponents(td => td.setContent(
                    `**Server Name:** \`${trackedServer.serverName}\`\n` +
                    `**Server ID:** \`${trackedServer.serverID}\`\n` +
                    `**Owner:** ${ownerMention} (\`${trackedServer.ownerID}\` — \`${ownerTag}\`)\n` +
                    `**Flagged By:** <@${message.author.id}> (\`${message.author.id}\`)\n` +
                    `**Reason:** ${reason}\n\n` +
                    `**Status:** Approved by <@${interaction.user.id}> on <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                    `**Action Summary:**\n${actionSummary.summaryText}`
                ))
                .addActionRowComponents(row =>
                    row.addComponents(
                        new ButtonBuilder().setCustomId(approveId).setLabel('Approved').setEmoji('✅').setStyle(ButtonStyle.Success).setDisabled(true)
                    )
                );

            await reviewMessage.edit({ components: [resolvedContainer], ...V2 });
            await interaction.editReply(actionSummary.ephemeralMessage);
            await sendAbuseLog(client, {
                flagContext,
                actionBy: interaction.user.id,
                summary: actionSummary.summaryText,
                status: 'Approved',
            });
        }

        if (action === 'reject') {
            collector.stop('rejected');
            await interaction.deferReply({ ephemeral: true });

            const summaryText = `🚫 Request rejected by <@${interaction.user.id}>. No action was taken.`;
            
            const resolvedContainer = new ContainerBuilder()
                .setAccentColor(C.Warning)
                .addTextDisplayComponents(td => td.setContent(`## 🚨 Abuse Flag Rejected`))
                .addSeparatorComponents(sep => sep.setDivider(true))
                .addTextDisplayComponents(td => td.setContent(
                    `**Server Name:** \`${trackedServer.serverName}\`\n` +
                    `**Server ID:** \`${trackedServer.serverID}\`\n` +
                    `**Owner:** ${ownerMention} (\`${trackedServer.ownerID}\` — \`${ownerTag}\`)\n` +
                    `**Flagged By:** <@${message.author.id}> (\`${message.author.id}\`)\n` +
                    `**Reason:** ${reason}\n\n` +
                    `**Status:** Rejected by <@${interaction.user.id}> on <t:${Math.floor(Date.now() / 1000)}:F>\n\n` +
                    `**Action Summary:**\n${summaryText}`
                ))
                .addActionRowComponents(row =>
                    row.addComponents(
                        new ButtonBuilder().setCustomId(rejectId).setLabel('Rejected').setEmoji('🚫').setStyle(ButtonStyle.Danger).setDisabled(true)
                    )
                );

            await reviewMessage.edit({ components: [resolvedContainer], ...V2 });
            await interaction.editReply('Abuse flag rejected. No action was taken.');
            await sendAbuseLog(client, {
                flagContext,
                actionBy: interaction.user.id,
                summary: summaryText,
                status: 'Rejected',
            });
        }
    });
};

async function handleApproval({ serverId, ownerId, interaction, abuseReason }) {
    const summaryLines = [];
    let serversDeleted = 0;
    const serverDeleteFailures = [];
    let userDeleted = false;
    let userDeleteMessage = '';
    let banMessage = '';

    const ownerDoc = await userData.findOne({ ID: ownerId }).catch(() => null);
    const trackedServers = await serverData.find({ ownerID: ownerId }).catch(() => []);
    const trackedServerMap = new Map(trackedServers.map(doc => [String(doc.serverAdminID), doc]));

    if (ownerDoc) {
        try {
            const response = await axios.get(`${config.pterodactyl.host}/api/admin/users/${ownerDoc.consoleID}/servers?per_page=100`, { headers: PANEL_HEADERS });
            const servers = response.data?.servers?.data || [];
            for (const srv of servers) {
                try {
                    await axios.delete(`${config.pterodactyl.host}/api/admin/servers/${srv.uuid}`, { headers: PANEL_HEADERS, data: { force: true, delete_backups: true } });
                    serversDeleted += 1;
                    const trackedDoc = trackedServerMap.get(String(srv.uuid));
                    if (trackedDoc) {
                        await serverData.deleteOne({ _id: trackedDoc._id });
                        trackedServerMap.delete(String(srv.uuid));
                    }
                } catch (err) {
                    serverDeleteFailures.push(`${srv.uuid_short || srv.uuid}: ${formatError(err)}`);
                }
            }
        } catch (err) {
            serverDeleteFailures.push(`Failed to fetch servers from panel: ${formatError(err)}`);
        }
    } else if (trackedServers.length) {
        for (const doc of trackedServers) {
            try {
                await axios.delete(`${config.pterodactyl.host}/api/admin/servers/${doc.serverAdminID}`, { headers: PANEL_HEADERS, data: { force: true, delete_backups: true } });
                serversDeleted += 1;
                await serverData.deleteOne({ _id: doc._id });
            } catch (err) {
                serverDeleteFailures.push(`${doc.serverID}: ${formatError(err)}`);
            }
        }
    } else {
        serverDeleteFailures.push(`No server records were found for user \`${ownerId}\`.`);
    }

    if (ownerDoc) {
        try {
            await axios.delete(`${config.pterodactyl.host}/api/admin/users/${ownerDoc.consoleID}`, { headers: PANEL_HEADERS });
            await userData.deleteOne({ ID: ownerId });
            userDeleted = true;
        } catch (err) {
            userDeleteMessage = formatError(err);
        }
    } else {
        userDeleteMessage = 'User record not found in the database.';
    }

    if (global.serverCount?.get(ownerId)) {
        global.serverCount.delete(ownerId);
    }

    try {
        await interaction.guild.members.ban(ownerId, { reason: `Abuse Approval • ${abuseReason}`, deleteMessageSeconds: 0 });
        banMessage = `Banned <@${ownerId}> successfully.`;
    } catch (err) {
        try {
            await interaction.guild.bans.create(ownerId, { reason: `Abuse Approval • ${abuseReason}`, deleteMessageSeconds: 0 });
            banMessage = `Banned <@${ownerId}> successfully.`;
        } catch (banErr) {
            banMessage = `Failed to ban user: ${formatError(banErr)}`;
        }
    }

    if (serversDeleted > 0) {
        summaryLines.push(`✅ Deleted **${serversDeleted}** server${serversDeleted === 1 ? '' : 's'} from the panel.`);
    } else {
        summaryLines.push('⚠️ No servers were deleted.');
    }

    if (serverDeleteFailures.length) {
        summaryLines.push(`⚠️ Server deletion issues:\n- ${serverDeleteFailures.join('\n- ')}`.slice(0, 900));
    }

    if (userDeleted) {
        summaryLines.push('✅ Panel user deleted.');
    } else {
        summaryLines.push(`⚠️ Panel user not deleted: ${userDeleteMessage || 'Unknown issue.'}`);
    }

    summaryLines.push(banMessage || '⚠️ No ban action performed.');

    return {
        summaryText: summaryLines.join('\n').slice(0, 1020),
        ephemeralMessage: [
            serversDeleted ? `Deleted ${serversDeleted} server(s).` : 'No servers were removed.',
            serverDeleteFailures.length ? `Server deletion issues: ${serverDeleteFailures.join('; ')}` : null,
            userDeleted ? 'Panel user deleted.' : `User deletion issue: ${userDeleteMessage || 'Unknown.'}`,
            banMessage,
        ].filter(Boolean).join('\n'),
    };
}

async function sendAbuseLog(client, { flagContext, actionBy, summary, status = 'Approved' }) {
    if (!ABUSE_LOG_CHANNEL_ID) return;

    try {
        let channel = client.channels.cache.get(ABUSE_LOG_CHANNEL_ID);
        if (!channel) channel = await client.channels.fetch(ABUSE_LOG_CHANNEL_ID).catch(() => null);
        if (!channel?.isTextBased()) return;

        const logContainer = new ContainerBuilder()
            .setAccentColor(C.Error)
            .addTextDisplayComponents(td => td.setContent(`## 🚨 Abuse Case Update`))
            .addSeparatorComponents(sep => sep.setDivider(true))
            .addTextDisplayComponents(td => td.setContent(
                `**Server:** \`${flagContext.serverName}\` (\`${flagContext.serverId}\`)\n` +
                `**Owner:** <@${flagContext.ownerId}> (\`${flagContext.ownerId}\`)\n` +
                `**Flagged By:** <@${flagContext.flaggedBy}>\n` +
                `**Actioned By:** <@${actionBy}>\n` +
                `**Status:** ${status}\n\n` +
                `**Reason:** ${flagContext.reason}\n\n` +
                `**Summary:**\n${summary || 'No summary available.'}`
            ));

        await channel.send({ components: [logContainer], ...V2 });
    } catch (err) {
        console.error('[AbuseLog] Failed to send approval log:', err.message);
    }
}

function buildCustomId(action, serverId, ownerId) {
    return `abuse|${action}|${serverId}|${ownerId}`;
}
