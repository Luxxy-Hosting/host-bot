const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, ComponentType } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');
const serverData = require('../../models/serverData');
const userData = require('../../models/userData');

const APPROVER_ROLE_ID = '941026456446828568';
const ABUSE_LOG_CHANNEL_ID = config.channelID?.abuse;
const PANEL_HEADERS = {
    'Authorization': `Bearer ${config.pterodactyl.adminApiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'Application/vnd.pterodactyl.v1+json',
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
        return message.reply('You do not have the required permissions to use this command.');
    }

    const serverIdentifier = args[1]?.toLowerCase();
    if (!serverIdentifier) {
        return message.reply(`Please provide a server identifier. Usage: \`${config.bot.prefix}staff abuse <identifier> [reason]\``);
    }

    if (!isAlphanumeric(serverIdentifier) || serverIdentifier.length < 4) {
        return message.reply('Please provide a valid server identifier (example: `668568ff`).');
    }

    const reasonInput = args.slice(2).join(' ').trim() || 'No reason provided.';
    const reason = reasonInput.length > 1000 ? `${reasonInput.slice(0, 997)}...` : reasonInput;

    const trackedServer = await serverData.findOne({ serverID: serverIdentifier });
    if (!trackedServer) {
        return message.reply(`I couldn't find any tracked server with the ID \`${serverIdentifier}\`.`);
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

    const embed = new EmbedBuilder()
        .setColor(Colors.Yellow)
        .setTitle('🚨 Abuse Flag Created')
        .setDescription('A staff member reported an abusive server. An approver must review this request before we remove the user.')
        .addFields(
            { name: 'Server Name', value: `\`${trackedServer.serverName}\``, inline: true },
            { name: 'Server ID', value: `\`${trackedServer.serverID}\``, inline: true },
            { name: 'Owner', value: `${ownerMention} (\`${trackedServer.ownerID}\`)\nTag: \`${ownerTag}\``, inline: false },
            { name: 'Flagged By', value: `<@${message.author.id}> (\`${message.author.id}\`)`, inline: false },
            { name: 'Reason', value: reason, inline: false },
            { name: 'Status', value: 'Pending approval', inline: false }
        )
        .setTimestamp();

    const approveId = buildCustomId('approve', trackedServer.serverID, trackedServer.ownerID);
    const rejectId = buildCustomId('reject', trackedServer.serverID, trackedServer.ownerID);
    const reviewMessage = await message.reply({ embeds: [embed], components: [buildActionRow({ approveId, rejectId, state: 'pending' })] });

    const collector = reviewMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
    });

    collector.on('collect', async interaction => {
        if (![approveId, rejectId].includes(interaction.customId)) return;

        if (!interaction.member.roles.cache.has(APPROVER_ROLE_ID)) {
            return interaction.reply({
                content: `Only members with <@&${APPROVER_ROLE_ID}> can approve this request.`,
                ephemeral: true,
            });
        }

        const [, action, serverId, ownerId] = interaction.customId.split('|');
        const reasonField = interaction.message.embeds[0]?.fields?.find(field => field.name === 'Reason');
        const abuseReason = reasonField?.value || 'No reason provided.';

        if (action === 'approve') {
            collector.stop('approved');
            await interaction.deferReply({ ephemeral: true });

            const actionSummary = await handleApproval({
                serverId,
                ownerId,
                interaction,
                abuseReason,
            });

            const updatedEmbed = buildResolutionEmbed({
                interaction,
                originalEmbed: interaction.message.embeds[0],
                summaryText: actionSummary.summaryText,
                statusText: `Approved by <@${interaction.user.id}> on <t:${Math.floor(Date.now() / 1000)}:F>`,
                color: Colors.Red,
                footerPrefix: 'Approved by',
            });

            await reviewMessage.edit({
                embeds: [updatedEmbed],
                components: [buildActionRow({ approveId, rejectId, state: 'approved' })],
            });
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
            const updatedEmbed = buildResolutionEmbed({
                interaction,
                originalEmbed: interaction.message.embeds[0],
                summaryText,
                statusText: `Rejected by <@${interaction.user.id}> on <t:${Math.floor(Date.now() / 1000)}:F>`,
                color: Colors.Yellow,
                footerPrefix: 'Rejected by',
            });

            await reviewMessage.edit({
                embeds: [updatedEmbed],
                components: [buildActionRow({ approveId, rejectId, state: 'rejected' })],
            });

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
            const response = await axios.get(`${config.pterodactyl.host}/api/application/users/${ownerDoc.consoleID}?include=servers`, {
                headers: PANEL_HEADERS,
            });
            const servers = response.data.attributes.relationships?.servers?.data || [];

            for (const srv of servers) {
                try {
                    await axios.delete(`${config.pterodactyl.host}/api/application/servers/${srv.attributes.id}/force`, {
                        headers: PANEL_HEADERS,
                    });
                    serversDeleted += 1;
                    const trackedDoc = trackedServerMap.get(String(srv.attributes.id));
                    if (trackedDoc) {
                        await serverData.deleteOne({ _id: trackedDoc._id });
                        trackedServerMap.delete(String(srv.attributes.id));
                    }
                } catch (err) {
                    serverDeleteFailures.push(`${srv.attributes.identifier || srv.attributes.id}: ${formatError(err)}`);
                }
            }
        } catch (err) {
            serverDeleteFailures.push(`Failed to fetch servers from panel: ${formatError(err)}`);
        }
    } else if (trackedServers.length) {
        for (const doc of trackedServers) {
            try {
                await axios.delete(`${config.pterodactyl.host}/api/application/servers/${doc.serverAdminID}/force`, {
                    headers: PANEL_HEADERS,
                });
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
            await axios.delete(`${config.pterodactyl.host}/api/application/users/${ownerDoc.consoleID}`, {
                headers: PANEL_HEADERS,
            });
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
        await interaction.guild.members.ban(ownerId, {
            reason: `Abuse Approval • ${abuseReason}`,
            deleteMessageSeconds: 0,
        });
        banMessage = `Banned <@${ownerId}> successfully.`;
    } catch (err) {
        try {
            await interaction.guild.bans.create(ownerId, {
                reason: `Abuse Approval • ${abuseReason}`,
                deleteMessageSeconds: 0,
            });
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

function buildResolutionEmbed({ interaction, originalEmbed, summaryText, statusText, color, footerPrefix }) {
    const embed = EmbedBuilder.from(originalEmbed)
        .setColor(color)
        .setTimestamp(new Date());

    const fields = originalEmbed.fields?.map(field => {
        if (field.name === 'Status') {
            return {
                name: 'Status',
                value: statusText,
                inline: field.inline,
            };
        }
        return field;
    }) || [];

    embed.setFields(fields);
    embed.addFields({ name: 'Action Summary', value: summaryText || 'No additional details.' });
    embed.setFooter({ text: `${footerPrefix} ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL({ size: 128 }) });

    return embed;
}

async function sendAbuseLog(client, { flagContext, actionBy, summary, status = 'Approved' }) {
    if (!ABUSE_LOG_CHANNEL_ID) return;

    try {
        let channel = client.channels.cache.get(ABUSE_LOG_CHANNEL_ID);
        if (!channel) {
            channel = await client.channels.fetch(ABUSE_LOG_CHANNEL_ID).catch(() => null);
        }
        if (!channel?.isTextBased()) return;

        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('Abuse Case Update')
            .addFields(
                { name: 'Server', value: `\`${flagContext.serverName}\` (\`${flagContext.serverId}\`)`, inline: true },
                { name: 'Owner', value: `<@${flagContext.ownerId}> (\`${flagContext.ownerId}\`)`, inline: true },
                { name: 'Flagged By', value: `<@${flagContext.flaggedBy}>`, inline: true },
                { name: 'Status', value: status, inline: true },
                { name: 'Actioned By', value: `<@${actionBy}>`, inline: true },
                { name: 'Reason', value: flagContext.reason, inline: false },
                { name: 'Summary', value: summary || 'No summary available.', inline: false },
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    } catch (err) {
        console.error('[AbuseLog] Failed to send approval log:', err.message);
    }
}

function buildCustomId(action, serverId, ownerId) {
    return `abuse|${action}|${serverId}|${ownerId}`;
}

function buildActionRow({ approveId, rejectId, state = 'pending' }) {
    const isPending = state === 'pending';
    const approveButton = new ButtonBuilder()
        .setCustomId(approveId)
        .setLabel(state === 'approved' ? 'Approved' : 'Approve & Ban')
        .setEmoji(state === 'approved' ? '✅' : '🛑')
        .setStyle(state === 'approved' ? ButtonStyle.Success : ButtonStyle.Danger)
        .setDisabled(!isPending);

    const rejectButton = new ButtonBuilder()
        .setCustomId(rejectId)
        .setLabel(state === 'rejected' ? 'Rejected' : 'Reject')
        .setEmoji(state === 'rejected' ? '🚫' : '✋')
        .setStyle(state === 'rejected' ? ButtonStyle.Danger : ButtonStyle.Secondary)
        .setDisabled(!isPending);

    return new ActionRowBuilder().addComponents(approveButton, rejectButton);
}
