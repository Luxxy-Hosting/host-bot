const { EmbedBuilder, Colors } = require('discord.js'); // Updated import for v14+
const config = require('../../config.json'); // Assuming this path is correct
const axios = require('axios');

// Helper function to convert bytes to a human-readable format
function formatBytes(bytes, decimals = 2) {
    if (bytes === null || bytes === undefined || isNaN(parseFloat(bytes)) || !isFinite(bytes)) return 'N/A';
    if (Number(bytes) === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(Number(bytes)) / Math.log(k));
    return parseFloat((Number(bytes) / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

module.exports = async (client, message, args) => {
    // Ensure luxxy config exists
    if (!config.luxxy || !config.luxxy.apiUrl || !config.luxxy.apiToken) {
        console.error('Luxxy API configuration is missing in config.json');
        return message.reply('Server configuration error. Please contact bot admin.');
    }

    let apiResponse;
    try {
        apiResponse = await axios.get(config.luxxy.apiUrl + '/api/application/servers', {
            headers: {
                'Authorization': `Bearer ${config.luxxy.apiToken}`,
                'Accept': 'application/json', // Good practice to specify accept header
                'content-type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error fetching servers from Luxxy API:');
        let errorMsg = 'An error occurred while fetching server data.';
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.error('Response Data:', error.response.data);
            console.error('Response Status:', error.response.status);
            console.error('Response Headers:', error.response.headers);
            errorMsg += ` (API Error: ${error.response.status})`;
        } else if (error.request) {
            // The request was made but no response was received
            console.error('Request Data:', error.request);
            errorMsg += ' (No response from API)';
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error Message:', error.message);
            errorMsg += ' (Request setup error)';
        }
        return message.reply(errorMsg);
    }

    if (!apiResponse || !apiResponse.data || !apiResponse.data.data) {
        return message.reply('Failed to retrieve valid server data from the API.');
    }

    const servers = apiResponse.data.data;

    if (servers.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle('Server List')
            .setDescription('No servers found.')
            .setColor(Colors.Yellow) // Using Yellow for "not found" type messages
            .setTimestamp();
        return message.reply({ embeds: [embed] });
    }

    const serverListParts = servers.map(server => {
        const {
            id,
            // uuid, // Included in API response, but might be too verbose for this list
            node_id,
            hostname,
            name,
            description,
            status,
            usages,
            limits,
            user_id,
            vmid,
            internal_id
        } = server;

        // Format Usages
        let usagesDisplay = 'No usage data provided.';
        if (usages && Object.keys(usages).length > 0) {
            const usageDetails = [];
            if (usages.bandwidth !== undefined) {
                usageDetails.push(`Bandwidth: ${formatBytes(usages.bandwidth)}`);
            }
            // Add other specific usage fields here if they become available
            // e.g., usageDetails.push(`CPU: ${usages.cpu_usage_percentage}%`);
            if (usageDetails.length > 0) {
                usagesDisplay = '```\n' + usageDetails.join('\n') + '\n```';
            }
        }

        // Format Limits
        let limitsDisplay = 'No limit data provided.';
        if (limits && Object.keys(limits).length > 0) {
            const limitDetails = [
                `CPU: ${limits.cpu !== undefined ? limits.cpu + ' cores' : 'N/A'}`,
                `Memory: ${formatBytes(limits.memory)}`,
                `Disk: ${formatBytes(limits.disk)}`,
                `Bandwidth Allotment: ${formatBytes(limits.bandwidth)}`,
                `Snapshots: ${limits.snapshots !== undefined ? limits.snapshots : 'N/A'}`,
                `Backups: ${limits.backups !== undefined ? limits.backups : 'N/A'}`,
            ];
            // You could add more details from limits.addresses or limits.mac_address if needed
            limitsDisplay = '```\n' + limitDetails.join('\n') + '\n```';
        }

        return `**${name || 'Unnamed Server'}** (ID: \`${id}\`)
Hostname: \`${hostname || 'N/A'}\`
Status: \`${status || 'N/A'}\`
Node ID: \`${node_id || 'N/A'}\`
User ID: \`${user_id || 'N/A'}\`
VMID: \`${vmid || 'N/A'}\`
Internal ID: \`${internal_id || 'N/A'}\`
Description: \`${description || 'N/A'}\`
Usages:
${usagesDisplay}
Limits:
${limitsDisplay}`;
    });

    let serverListDescription = serverListParts.join('\n\n---\n\n'); // Separator between servers

    const embed = new EmbedBuilder()
        .setTitle('Server List')
        .setColor(Colors.Green)
        .setTimestamp();

    const MAX_DESCRIPTION_LENGTH = 4096;
    if (serverListDescription.length > MAX_DESCRIPTION_LENGTH) {
        serverListDescription = serverListDescription.substring(0, MAX_DESCRIPTION_LENGTH - 30) + "\n... (list truncated)";
        embed.setFooter({ text: `Total Servers: ${servers.length} | Displaying a truncated list.` });
    } else {
        embed.setFooter({ text: `Total Servers: ${servers.length}` });
    }

    embed.setDescription(serverListDescription);

    try {
        await message.reply({ embeds: [embed] });
    } catch (replyError) {
        console.error("Failed to send Discord reply:", replyError);
        // Fallback if embed is too large for some other reason
        if (replyError.code === 50035) { // Invalid Form Body (often due to length)
             message.reply("The server list is too long to display. Please try a more specific query if available.");
        } else {
             message.reply("An error occurred while trying to display the server list.");
        }
    }
};