// Filename: serverinfo.js (or similar)

const { EmbedBuilder, Colors } = require('discord.js');
const config = require('../../config.json'); // Adjust path if necessary
const axios = require('axios');

/**
 * Helper function to convert bytes to a human-readable format.
 * @param {number|string|null|undefined} bytes - The number of bytes.
 * @param {number} [decimals=2] - The number of decimal places.
 * @returns {string} Human-readable string (e.g., "1.00 GB") or "N/A".
 */
function formatBytes(bytes, decimals = 2) {
    if (bytes === null || bytes === undefined || isNaN(parseFloat(String(bytes))) || !isFinite(Number(bytes))) return 'N/A';
    const numericBytes = Number(bytes);
    if (numericBytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    // Handle very small byte values that are not zero
    if (numericBytes > 0 && numericBytes < 1) {
        return numericBytes.toFixed(dm) + ' ' + sizes[0];
    }

    const i = Math.floor(Math.log(numericBytes) / Math.log(k));

    // Ensure 'i' is within the bounds of the 'sizes' array
    const sizeIndex = Math.max(0, Math.min(i, sizes.length - 1));

    return parseFloat((numericBytes / Math.pow(k, sizeIndex)).toFixed(dm)) + ' ' + sizes[sizeIndex];
}


module.exports = async (client, message, args) => {
    if (!args[1]) {
        return message.reply('Please provide a server ID or the beginning of its UUID (e.g., `ffa92c56`).');
    }
    const serverIdentifier = args[1].toLowerCase();

    const allServersUrl = `${config.luxxy.apiUrl}/api/application/servers`;
    const apiHeaders = {
        'Authorization': `Bearer ${config.luxxy.apiToken}`,
        'Accept': 'application/json',
    };

    // Step 1: Fetch all servers to find the full UUID
    let allServersResponse;
    try {
        allServersResponse = await axios.get(allServersUrl, { headers: apiHeaders });
    } catch (error) {
        console.error(`Error fetching all servers from API (${allServersUrl}):`, error.response ? error.response.data : error.message);
        return message.reply('Could not fetch the server list to find your server. The API might be experiencing issues.');
    }

    if (!allServersResponse.data || !allServersResponse.data.data || !Array.isArray(allServersResponse.data.data)) {
        console.warn('Unexpected format for all servers response:', allServersResponse.data);
        return message.reply('Received an unexpected response format when fetching the server list.');
    }

    const servers = allServersResponse.data.data;
    const matchedServers = servers.filter(server =>
        (server.id && server.id.toLowerCase() === serverIdentifier) ||
        (server.uuid && server.uuid.toLowerCase().startsWith(serverIdentifier))
    );

    // Step 2: Handle matches
    if (matchedServers.length === 0) {
        return message.reply(`No server found matching the identifier: \`${serverIdentifier}\`. Please check the ID/UUID and try again.`);
    }

    if (matchedServers.length > 1) {
        const serverLinks = matchedServers.map(s => `• \`${s.name || 'Unnamed Server'}\` (ID: \`${s.id}\`, UUID: \`${s.uuid ? s.uuid.substring(0,8) : 'N/A'}...\`)`).join('\n');
        return message.reply(`Multiple servers found for identifier \`${serverIdentifier}\`. Please be more specific or use a longer/full UUID:\n${serverLinks}`);
    }

    const targetServerSummary = matchedServers[0];
    const targetServerFullUuid = targetServerSummary.uuid;

    if (!targetServerFullUuid) {
        return message.reply(`The matched server (\`${targetServerSummary.name || targetServerSummary.id}\`) does not have a full UUID. Cannot fetch details.`);
    }

    // Step 3: Fetch specific server details
    const specificServerUrl = `${config.luxxy.apiUrl}/api/application/servers/${targetServerFullUuid}`;
    let specificServerResponse;
    try {
        specificServerResponse = await axios.get(specificServerUrl, { headers: apiHeaders });
    } catch (error) {
        console.error(`Error fetching specific server details for UUID ${targetServerFullUuid}:`, error.response ? error.response.data : error.message);
        if (error.response && error.response.status === 404) {
            return message.reply(`Server with UUID \`${targetServerFullUuid}\` (Name: ${targetServerSummary.name || 'N/A'}) was found in the list, but its detailed information could not be fetched (Error 404). It might have been recently deleted.`);
        }
        return message.reply(`Could not fetch details for server \`${targetServerSummary.name || targetServerFullUuid}\`. An API error occurred.`);
    }

    // Check if the detailed server data is present as expected.
    // Based on user log, data is in specificServerResponse.data.data
    if (!specificServerResponse.data || !specificServerResponse.data.data) {
        console.warn("Fetched specific server data, but the expected 'data' field (containing server details) is missing. Response:", specificServerResponse.data);
        return message.reply('Could not parse server details. The API response format might be different than expected.');
    }

    const serverData = specificServerResponse.data.data; // Corrected: server details are here

    // Step 4: Build and send the embed
    const embed = new EmbedBuilder()
        .setColor(Colors.Aqua) // Default color, can be changed based on status
        .setTitle(`Server Info: ${serverData.name || 'N/A'}`)
        // Set timestamp: use updated_at, fallback to created_at, then to current time
        .setTimestamp(
            serverData.updated_at ? new Date(serverData.updated_at) : 
            (serverData.created_at ? new Date(serverData.created_at) : new Date())
        );

    // Basic Information
    embed.addFields(
        { name: '📋 Name', value: `\`${serverData.name || 'N/A'}\``, inline: true },
        // Use 'id' for the short ID, as 'identifier' might not be present.
        { name: '🆔 Short ID', value: `\`${serverData.id || 'N/A'}\``, inline: true },
        { name: '🔗 Full UUID', value: `\`${serverData.uuid || 'N/A'}\``, inline: false },
        { name: '📝 Description', value: serverData.description || 'No description provided.', inline: false }
    );

    // Status
    let serverStatus = serverData.status || 'N/A'; // e.g., running, offline, starting
    if (serverData.suspended) { // 'suspended' field might not be in user's API
        serverStatus = 'Suspended';
        embed.setColor(Colors.Red);
    } else if (serverStatus === 'running') {
        embed.setColor(Colors.Green);
    } else if (serverStatus === 'starting' || serverStatus === 'stopping') {
        embed.setColor(Colors.Yellow);
    } else { // e.g., offline, or other unknown states (like null in user log)
        embed.setColor(Colors.Grey);
    }
    embed.addFields({ name: '💡 Status', value: `\`${String(serverStatus).toUpperCase()}\``, inline: true });
    // Use node_id as per user's API log structure
    embed.addFields({ name: '📦 Node ID', value: `\`${serverData.node_id || 'N/A'}\``, inline: true });

    // Resource Limits
    if (serverData.limits) {
        const limits = serverData.limits;
        embed.addFields(
            { name: '⚙️ CPU Limit', value: `\`${limits.cpu !== undefined ? limits.cpu + ' Cores' : 'N/A'}\``, inline: true },
            { name: '🧠 Memory Limit', value: `\`${formatBytes(limits.memory)}\``, inline: true },
            { name: '💾 Disk Limit', value: `\`${formatBytes(limits.disk)}\``, inline: true }
        );
        if (limits.bandwidth !== undefined && limits.bandwidth !== null) {
             embed.addFields({ name: '📶 Bandwidth Limit', value: `\`${limits.bandwidth === 0 ? 'Unlimited' : formatBytes(limits.bandwidth)}\``, inline: true });
        }
    } else {
        embed.addFields({ name: '📊 Resource Limits', value: 'Limit data not available.', inline: false });
    }

    // Feature Limits (Common in Pterodactyl, may not be in user's API)
    if (serverData.feature_limits) {
        const fl = serverData.feature_limits;
        embed.addFields(
            { name: '🗄️ Databases Allowed', value: `\`${fl.databases !== undefined ? fl.databases : 'N/A'}\``, inline: true },
            { name: '🔗 Allocations Allowed', value: `\`${fl.allocations !== undefined ? fl.allocations : 'N/A'}\``, inline: true },
            { name: '💽 Backups Allowed', value: `\`${fl.backups !== undefined ? fl.backups : 'N/A'}\``, inline: true }
        );
    }

    // Resource Usage
    if (serverData.usages && typeof serverData.usages === 'object' && Object.keys(serverData.usages).length > 0) {
        let usageString = '';
        if (serverData.usages.bandwidth !== undefined) {
            usageString += `Bandwidth (cycle): \`${formatBytes(serverData.usages.bandwidth)}\`\n`;
        }
        // Add other known usage fields here if your API provides them
        // e.g., if serverData.usages.cpu_current, serverData.usages.memory_current etc.

        if (usageString.trim()) {
            embed.addFields({ name: '📈 Resource Usage', value: usageString.trim(), inline: false });
        } else {
            embed.addFields({ name: '📈 Resource Usage', value: 'Basic usage data found, but specific metrics (CPU/RAM) may not be available via this endpoint. Raw: `'+JSON.stringify(serverData.usages)+'`', inline: false });
        }
    } else {
        embed.addFields({ name: '📈 Resource Usage', value: 'Detailed usage data (like current CPU/RAM) is often not available from this specific API endpoint.', inline: false });
    }

    // Timestamps (created_at might not be in user's API response for specific server)
    embed.addFields({ name: '⏳ Created At', value: serverData.created_at ? `<t:${Math.floor(new Date(serverData.created_at).getTime() / 1000)}:R>` : 'N/A', inline: true });
    
    if (serverData.updated_at) { // Add 'Last Updated' field only if updated_at exists
        embed.addFields({ name: '🛠️ Last Updated', value: `<t:${Math.floor(new Date(serverData.updated_at).getTime() / 1000)}:R>`, inline: true });
    }

    try {
        await message.reply({ embeds: [embed] });
    } catch (replyError) {
        console.error("Failed to send Discord reply for server info:", replyError);
        if (replyError.code === 50035) { // Invalid Form Body
            message.reply("An error occurred: The server information is too long to display in a single message. This might be due to a very long description or many data fields.");
        } else {
            message.reply("An error occurred while trying to display the server information.");
        }
    }
};
