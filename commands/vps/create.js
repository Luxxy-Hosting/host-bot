// Filename: create.js

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, PermissionFlagsBits } = require('discord.js');
const config = require('../../config.json'); // Adjust path if necessary
const axios = require('axios');
const crypto = require('crypto');

/**
 * Generates a cryptographically strong random password.
 * @param {number} length - The desired length of the password.
 * @returns {string} The generated password.
 */
function generateRandomPassword(length = 16) {
    // Characters to include in the password. Avoid ambiguous characters like I, l, 1, O, 0.
    const charset = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*()_+-=[]{}|;:,.<>?";
    let password = "";
    const randomBytes = crypto.randomBytes(length);
    for (let i = 0; i < length; i++) {
        password += charset[randomBytes[i] % charset.length];
    }
    return password;
}

/**
 * Converts Gigabytes to Bytes.
 * @param {number} gb - Gigabytes.
 * @returns {number} Bytes.
 */
function gbToBytes(gb) {
    return gb * 1024 * 1024 * 1024;
}

module.exports = async (client, message, args) => {
    // Args: <vmname> <os_short_name> <ram_gb> <disk_gb>
    // Example: !vps create MyNewVM ubuntu22 4 50

    if (args.length < 4) {
        return message.reply(
            'Please provide all required arguments: `<vmname> <os_name> <ram_in_gb> <disk_in_gb>`\n' +
            `Example: \`${config.prefix || '!'}vps create MyDebian debian12 2 20\``
        );
    }

    const [vmName, osShortName, ramGbStr, diskGbStr] = args;

    const ramGb = parseFloat(ramGbStr);
    const diskGb = parseFloat(diskGbStr);

    // Validate inputs
    if (!vmName || !/^[a-zA-Z0-9-_]+$/.test(vmName)) {
        return message.reply('Invalid VM name. Use alphanumeric characters, hyphens, and underscores.');
    }
    if (isNaN(ramGb) || ramGb <= 0) {
        return message.reply('Invalid RAM size. Please provide a positive number for GB.');
    }
    if (isNaN(diskGb) || diskGb <= 0) {
        return message.reply('Invalid Disk size. Please provide a positive number for GB.');
    }

    // Validate configuration
    // if (!config.luxxy || !config.luxxy.baseUrl || !config.luxxy.apiToken || !config.luxxy.creationDefaults || !config.luxxy.os_templates) {
    //     console.error('Luxxy API configuration (baseUrl, apiToken, creationDefaults, os_templates) is missing or incomplete in config.json');
    //     return message.reply('Server creation configuration error. Please contact the bot administrator.');
    // }

    const { creationDefaults, os_templates, apiUrl, apiToken } = config.luxxy;

    // const templateUuid = os_templates[osShortName.toLowerCase()];
    // if (!templateUuid) {
    //     const availableOsText = Object.keys(os_templates).join(', ') || 'No OS templates configured.';
    //     return message.reply(`Invalid OS name: \`${osShortName}\`. Available OS names: \`${availableOsText}\`. Check config.json.`);
    // }

    const randomPassword = generateRandomPassword(16);
    const workingMsg = await message.reply(`Creating server \`${vmName}\`... This may take a moment.`);

    const memoryBytes = gbToBytes(ramGb);
    const diskBytes = gbToBytes(diskGb);

    // Construct hostname, e.g., vmName.yourconfigured.suffix
    // const hostname = `${vmName.toLowerCase()}.${creationDefaults.default_hostname_suffix || 'example.com'}`;

    const createPayload = {
        node_id: "1",
        user_id: "1", // This is the User ID in the panel, not Discord User ID
        name: vmName,
        hostname: "what", // You might want a different logic for hostname
        vmid: null, // Usually auto-assigned by the panel
        limits: {
            cpu: 4,
            memory: memoryBytes,
            disk: diskBytes,
            snapshots:  1,
            backups: 1,
            bandwidth: 0, // null or 0 for unlimited, or a value in bytes
            address_ids: [ 1 ] // If you need to pre-assign specific IP IDs
        },
        account_password: randomPassword,
        should_create_server: true,
        template_uuid: "e4660723-a2f0-465f-96f2-a9075a998f85",
        start_on_completion: true,
        // You might need other fields depending on your API, like 'environment' for Pterodactyl Docker images
        // or 'egg_id', 'nest_id' for Pterodactyl. The provided image is for a more generic VM setup.
    };

    const apiHeaders = {
        'Authorization': `Bearer ${apiToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    let newServerUuid;

    try {
        const createResponse = await axios.post(`${apiUrl}/api/application/servers`, createPayload, { headers: apiHeaders });

        if (createResponse.data && createResponse.data.data && createResponse.data.data.uuid) {
            newServerUuid = createResponse.data.data.uuid;
            await workingMsg.edit(`Server \`${vmName}\` (UUID: ${newServerUuid}) provisioned. Fetching details...`);
        } else {
            // Fallback if UUID is not in the expected place but creation might have succeeded
            // Pterodactyl, for example, returns attributes.uuid
            if (createResponse.data && createResponse.data.attributes && createResponse.data.attributes.uuid) {
                 newServerUuid = createResponse.data.attributes.uuid;
                 await workingMsg.edit(`Server \`${vmName}\` (UUID: ${newServerUuid}) provisioned. Fetching details...`);
            } else {
                console.error('Server creation API response did not contain expected UUID:', createResponse.data);
                return workingMsg.edit(`Server \`${vmName}\` might have been created, but its UUID could not be retrieved from the API response. Please check the panel.`);
            }
        }
    } catch (error) {
        console.error('Error creating server via API:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        let errorDetail = 'An API error occurred.';
        return workingMsg.edit(`Failed to create server \`${vmName}\`. \n\`\`\`${errorDetail}\`\`\``);
    }

    // Step 2: Fetch server details to get IP address
    let serverDetails;
    let primaryIp = 'Not available';
    try {
        const detailsResponse = await axios.get(`${apiUrl}/api/application/servers/${newServerUuid}`, { headers: apiHeaders });
        // The structure of server details (especially IP) varies greatly between APIs.
        // Based on your serverinfo.js log, details are in `response.data.data`
        if (detailsResponse.data && detailsResponse.data.data) {
            serverDetails = detailsResponse.data.data;

            // Attempt to find IP address. This is highly API-specific.
            // From your log: serverData.limits.addresses might hold it.
            if (serverDetails.limits && serverDetails.limits.addresses) {
                if (Array.isArray(serverDetails.limits.addresses) && serverDetails.limits.addresses.length > 0) {
                    // If it's an array of strings (IPs)
                    if (typeof serverDetails.limits.addresses[0] === 'string') {
                        primaryIp = serverDetails.limits.addresses[0];
                    }
                    // If it's an array of objects, try common IP fields
                    else if (typeof serverDetails.limits.addresses[0] === 'object') {
                        const firstAddress = serverDetails.limits.addresses[0];
                        primaryIp = firstAddress.ip || firstAddress.ip_address || firstAddress.address || 'IP field not found in address object';
                    }
                } else if (typeof serverDetails.limits.addresses === 'object' && !Array.isArray(serverDetails.limits.addresses)) {
                    // If it's a single object (less common for a list of addresses, but possible)
                     primaryIp = serverDetails.limits.addresses.ip || serverDetails.limits.addresses.ip_address || serverDetails.limits.addresses.address || 'IP field not found in address object';
                }
            }
            // Pterodactyl specific IP location (example, adjust if your API is different)
            // else if (serverDetails.attributes && serverDetails.attributes.relationships && serverDetails.attributes.relationships.allocations && serverDetails.attributes.relationships.allocations.data.length > 0) {
            //    primaryIp = serverDetails.attributes.relationships.allocations.data[0].attributes.ip;
            // }

        } else {
            throw new Error("Server details response did not contain 'data.data' field.");
        }

    } catch (error) {
        console.error(`Error fetching details for server ${newServerUuid}:`, error.response ? error.response.data : error.message);
        await workingMsg.edit(`Server \`${vmName}\` created (UUID: ${newServerUuid}), but failed to fetch its full details (like IP address). Please check the panel.`);
        // Continue to show password button even if IP fetch fails
    }


    const successEmbed = new EmbedBuilder()
        .setTitle(`✅ Server Created: ${serverDetails ? serverDetails.name : vmName}`)
        .setColor(Colors.Green)
        .addFields(
            { name: '🏷️ Name', value: `\`${serverDetails ? serverDetails.name : vmName}\``, inline: true },
            { name: '🆔 Short ID', value: `\`${serverDetails ? serverDetails.id : 'N/A'}\``, inline: true },
            { name: '🔗 UUID', value: `\`${newServerUuid}\``, inline: false },
            { name: '🌐 IP Address', value: `\`${primaryIp}\``, inline: true },
            { name: '👤 Username', value: '`root` (or OS default)', inline: true }
            // Add more fields if available and relevant from serverDetails
        )
        .setFooter({ text: `Server created by ${message.author.tag}` })
        .setTimestamp();

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`show_password_${newServerUuid}_${message.id}`) // Unique ID for this interaction
                .setLabel('Show Password')
                .setStyle(ButtonStyle.Danger) // Danger to indicate sensitive action
        );

    await workingMsg.edit({ content: `Server \`${vmName}\` is ready!`, embeds: [successEmbed], components: [row] });

    // Collector for the button
    const filter = i => i.customId === `show_password_${newServerUuid}_${message.id}` && i.user.id === message.author.id;
    const collector = message.channel.createMessageComponentCollector({ filter, time: 300000 }); // 5 minutes

    collector.on('collect', async i => {
        try {
            await i.reply({ content: `🔑 Password for \`${vmName}\`: \`\`\`${randomPassword}\`\`\``, ephemeral: true });
            // Optionally disable the button after click
            const disabledRow = new ActionRowBuilder().addComponents(
                ButtonBuilder.from(row.components[0]).setDisabled(true)
            );
            await workingMsg.edit({ components: [disabledRow] });
            collector.stop('password_shown');
        } catch (interactionError) {
            console.error("Error replying to password button interaction:", interactionError);
        }
    });

    collector.on('end', (collected, reason) => {
        if (reason !== 'password_shown') {
            // Timeout or other reason, disable button
            const disabledRow = new ActionRowBuilder().addComponents(
                 ButtonBuilder.from(row.components[0]).setDisabled(true).setLabel('Password (Expired)')
            );
            workingMsg.edit({ components: [disabledRow] }).catch(e => console.error("Error disabling button on collector end:", e));
        }
    });
};
