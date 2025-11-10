const { EmbedBuilder, Colors } = require('discord.js'); // For discord.js v14+
const config = require('../../config.json'); // Assuming this path is correct
const axios = require('axios');

module.exports = async (client, message, args) => {

    let apiResponse;
    try {
        apiResponse = await axios.get(config.luxxy.apiUrl + '/api/application/locations', {
            headers: {
                'Authorization': `Bearer ${config.luxxy.apiToken}`,
                'Accept': 'application/json',
            }
        });
    } catch (error) {
        console.error(`Error fetching locations from API (${apiUrl}):`);
        let errorMsg = 'An error occurred while fetching location data.';
        if (error.response) {
            console.error('Response Data:', error.response.data);
            console.error('Response Status:', error.response.status);
            errorMsg += ` (API Error: ${error.response.status})`;
        } else if (error.request) {
            console.error('Request Data:', error.request);
            errorMsg += ' (No response from API)';
        } else {
            console.error('Error Message:', error.message);
            errorMsg += ' (Request setup error)';
        }
        return message.reply(errorMsg);
    }

    if (!apiResponse || !apiResponse.data || !apiResponse.data.data) {
        console.warn(`No valid location data received from API (${apiUrl}). Response:`, apiResponse ? apiResponse.data : 'No response object');
        return message.reply('Failed to retrieve valid location data from the API.');
    }

    const locations = apiResponse.data.data;

    if (locations.length === 0) {
        const embed = new EmbedBuilder()
            .setTitle('Location List')
            .setDescription('No locations found.')
            .setColor(Colors.Yellow)
            .setTimestamp();
        return message.reply({ embeds: [embed] });
    }

    const locationListParts = locations.map(location => {
        // Adjust these fields based on your actual API response for locations
        // Pterodactyl typically has id, short, long, description in an 'attributes' object.
        // If your 'data' objects directly contain these, use location.id, location.short etc.
        // The example provided for servers had flat objects in `data`, so assuming the same here.
        const id = location.id || 'N/A';
        const shortName = location.short || 'N/A';
        const longName = location.long || location.name || location.description || 'No descriptive name';
        // Add any other relevant fields you want to display from the 'location' object

        return `**${longName}** (ID: \`${id}\`)
Short Code: \`${shortName}\``;
        // Example for more details if available:
        // `Nodes Hosted: \`${location.nodes_count || 0}\``
        // `Country: \`${location.country_code || 'N/A'}\``
    });

    let locationListDescription = locationListParts.join('\n\n---\n\n');

    const embed = new EmbedBuilder()
        .setTitle('Location List')
        .setColor(Colors.Green)
        .setTimestamp();

    const MAX_DESCRIPTION_LENGTH = 4096;
    if (locationListDescription.length > MAX_DESCRIPTION_LENGTH) {
        locationListDescription = locationListDescription.substring(0, MAX_DESCRIPTION_LENGTH - 30) + "\n... (list truncated)";
        embed.setFooter({ text: `Total Locations: ${locations.length} | Displaying a truncated list.` });
    } else {
        embed.setFooter({ text: `Total Locations: ${locations.length}` });
    }

    embed.setDescription(locationListDescription);

    try {
        await message.reply({ embeds: [embed] });
    } catch (replyError) {
        console.error("Failed to send Discord reply for locations command:", replyError);
        if (replyError.code === 50035) { // Invalid Form Body (often due to length)
             message.reply("The location list is too long to display. Please try a more specific query if available.");
        } else {
             message.reply("An error occurred while trying to display the location list.");
        }
    }
};