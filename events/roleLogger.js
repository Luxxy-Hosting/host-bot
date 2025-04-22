// events/roleLogger.js

const { EmbedBuilder, AuditLogEvent, PermissionsBitField, Colors } = require('discord.js');
const config = require('../config.json'); // Adjust path if necessary

// Helper function to get the executor from audit logs
async function getAuditLogExecutor(guild, eventType, targetId) {
    try {
        const fetchedLogs = await guild.fetchAuditLogs({
            type: eventType,
            limit: 5, // Check recent logs
        });

        // Find the specific log entry related to this event
        const auditEntry = fetchedLogs.entries.find(entry =>
            entry.target?.id === targetId && // Check if the target matches
            Date.now() - entry.createdTimestamp < 10000 // Check if it happened within the last 10 seconds
        );

        if (auditEntry) {
            return auditEntry.executor; // Return the user who performed the action
        }
    } catch (error) {
        // Ignore errors if bot lacks permissions or logs are unavailable
        if (error.code !== 50013) { // 50013 = Missing Permissions
             console.error(`RoleLogger: Error fetching audit logs in guild ${guild.id}:`, error);
        }
    }
    return null; // Return null if no executor found or error occurred
}


module.exports = (client) => {
    const logChannelId = config.channelID?.roleLogs;

    if (!logChannelId) {
        console.warn('RoleLogger: Log channel ID (config.channelID.roleLogs) not found in config.json. Role logging disabled.');
        return; // Stop if no log channel is configured
    }

    // --- Role Create ---
    client.on('roleCreate', async (role) => {
        if (!role.guild) return; // Ignore roles not in a guild context

        const logChannel = client.channels.cache.get(logChannelId);
        if (!logChannel || !logChannel.isTextBased()) {
             console.warn(`RoleLogger: Cannot find log channel with ID ${logChannelId} or it's not text-based.`);
             return;
        }

        const executor = await getAuditLogExecutor(role.guild, AuditLogEvent.RoleCreate, role.id);

        const embed = new EmbedBuilder()
            .setColor(Colors.Green)
            .setTitle('Role Created')
            .setDescription(`Role **${role.name}** was created.`)
            .addFields(
                { name: 'Role Name', value: role.name, inline: true },
                { name: 'Role ID', value: `\`${role.id}\``, inline: true },
                { name: 'Color', value: `\`${role.hexColor}\``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Role ID: ${role.id}` });

        if (executor) {
            embed.addFields({ name: 'Created By', value: `${executor.tag} (\`${executor.id}\`)`, inline: false });
            embed.setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL() });
        } else {
             embed.addFields({ name: 'Created By', value: 'Unknown (Could not fetch audit log)', inline: false });
        }

        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`RoleLogger: Failed to send message to log channel ${logChannelId}:`, error);
        }
    });

    // --- Role Delete ---
    client.on('roleDelete', async (role) => {
        if (!role.guild) return;

        const logChannel = client.channels.cache.get(logChannelId);
        if (!logChannel || !logChannel.isTextBased()) return; // Already warned above

        const executor = await getAuditLogExecutor(role.guild, AuditLogEvent.RoleDelete, role.id);

        const embed = new EmbedBuilder()
            .setColor(Colors.Red)
            .setTitle('Role Deleted')
            .setDescription(`Role **${role.name}** was deleted.`)
            .addFields(
                { name: 'Role Name', value: role.name, inline: true },
                { name: 'Role ID', value: `\`${role.id}\``, inline: true },
                { name: 'Color (Before)', value: `\`${role.hexColor}\``, inline: true }
            )
            .setTimestamp()
            .setFooter({ text: `Role ID: ${role.id}` });

        if (executor) {
            embed.addFields({ name: 'Deleted By', value: `${executor.tag} (\`${executor.id}\`)`, inline: false });
             embed.setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL() });
        } else {
             embed.addFields({ name: 'Deleted By', value: 'Unknown (Could not fetch audit log)', inline: false });
        }

         try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`RoleLogger: Failed to send message to log channel ${logChannelId}:`, error);
        }
    });

    // --- Role Update ---
    client.on('roleUpdate', async (oldRole, newRole) => {
        if (!newRole.guild) return;

        const logChannel = client.channels.cache.get(logChannelId);
        if (!logChannel || !logChannel.isTextBased()) return;

        const executor = await getAuditLogExecutor(newRole.guild, AuditLogEvent.RoleUpdate, newRole.id);

        const embed = new EmbedBuilder()
            .setColor(Colors.Blue)
            .setTitle('Role Updated')
            .setDescription(`Role **${oldRole.name}** (\`${newRole.id}\`) was updated.`)
            .setTimestamp()
            .setFooter({ text: `Role ID: ${newRole.id}` });

         if (executor) {
             embed.addFields({ name: 'Updated By', value: `${executor.tag} (\`${executor.id}\`)`, inline: false });
             embed.setAuthor({ name: executor.tag, iconURL: executor.displayAvatarURL() });
         } else {
              embed.addFields({ name: 'Updated By', value: 'Unknown (Could not fetch audit log)', inline: false });
         }

        let changes = [];

        // Check Name
        if (oldRole.name !== newRole.name) {
            changes.push({ name: 'Name Changed', value: `\`${oldRole.name}\` → \`${newRole.name}\``, inline: false });
            embed.setDescription(`Role **${newRole.name}** (\`${newRole.id}\`) was updated (previously \`${oldRole.name}\`).`); // Update description if name changed
        }

        // Check Color
        if (oldRole.hexColor !== newRole.hexColor) {
            changes.push({ name: 'Color Changed', value: `\`${oldRole.hexColor}\` → \`${newRole.hexColor}\``, inline: true });
        }

        // Check Permissions (Basic Check)
        if (oldRole.permissions.bitfield !== newRole.permissions.bitfield) {
            // More complex: Identify added/removed perms if needed
            // For simplicity, just note that they changed.
             const oldPerms = new PermissionsBitField(oldRole.permissions.bitfield).toArray();
             const newPerms = new PermissionsBitField(newRole.permissions.bitfield).toArray();
             const addedPerms = newPerms.filter(p => !oldPerms.includes(p));
             const removedPerms = oldPerms.filter(p => !newPerms.includes(p));

             let permChangeDesc = 'Permissions have changed.';
             if (addedPerms.length > 0) permChangeDesc += `\n**Added:** \`${addedPerms.join('`, `') || 'None'}\``;
             if (removedPerms.length > 0) permChangeDesc += `\n**Removed:** \`${removedPerms.join('`, `') || 'None'}\``;

             changes.push({ name: 'Permissions Changed', value: permChangeDesc.substring(0, 1024), inline: false });
        }

        // Check Hoist (Displayed separately)
        if (oldRole.hoist !== newRole.hoist) {
            changes.push({ name: 'Hoist Changed', value: `\`${oldRole.hoist}\` → \`${newRole.hoist}\``, inline: true });
        }

        // Check Mentionable
        if (oldRole.mentionable !== newRole.mentionable) {
            changes.push({ name: 'Mentionable Changed', value: `\`${oldRole.mentionable}\` → \`${newRole.mentionable}\``, inline: true });
        }

         // Check Icon
         if (oldRole.iconURL() !== newRole.iconURL()) {
             changes.push({ name: 'Icon Changed', value: `Icon was ${oldRole.iconURL() ? 'changed' : 'added'}.`, inline: true });
             // Optionally show old/new icon URL if needed
         }

         // Check Unicode Emoji
         if (oldRole.unicodeEmoji !== newRole.unicodeEmoji) {
             changes.push({ name: 'Emoji Changed', value: `${oldRole.unicodeEmoji || 'None'} → ${newRole.unicodeEmoji || 'None'}`, inline: true });
         }

        // Check Position - Often changes with other updates, might be noisy
        // if (oldRole.position !== newRole.position) {
        //     changes.push({ name: 'Position Changed', value: `\`${oldRole.position}\` → \`${newRole.position}\``, inline: true });
        // }

        if (changes.length === 0) {
            // If no tracked changes found, maybe audit log shows something else (like position)
            // Or maybe it was an internal/untracked change. Don't log unless changes detected.
            // console.log(`RoleLogger: Role update detected for ${newRole.name} but no tracked property changes found.`);
            return;
        }

        embed.addFields(changes);

         try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error(`RoleLogger: Failed to send message to log channel ${logChannelId}:`, error);
        }
    });

    console.log('RoleLogger event listeners registered.');
};
