const Discord = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = {
    name: 'powerofflocation1',
    category: 'Owner',
    description: 'Power off all servers in location 1.',
    aliases: ['shutdownloc1'],
    run: async (client, message) => {
        if (message.author.id !== config.settings.owner) return;

        const locationId = 1;
        const summary = {
            totalServers: 0,
            stopSent: 0,
            killSent: 0,
            failed: 0,
        };

        const embed = new Discord.EmbedBuilder()
            .setColor(Discord.Colors.Red)
            .setTitle('Powering off servers')
            .setDescription(`Collecting servers for location **${locationId}**...`)
            .setTimestamp();

        const statusMessage = await message.reply({ embeds: [embed] });

        try {
            const nodeResponse = await axios({
                url: `${config.pterodactyl.host}/api/application/nodes`,
                method: 'GET',
                params: { per_page: 100 },
                headers: {
                    Authorization: `Bearer ${config.pterodactyl.adminApiKey}`,
                    'Content-Type': 'application/json',
                    Accept: 'Application/vnd.pterodactyl.v1+json',
                },
            });

            const locationNodes = nodeResponse.data?.data?.filter(
                (node) => node?.attributes?.location_id === locationId,
            ) || [];

            if (locationNodes.length === 0) {
                embed.setDescription(`No nodes found for location **${locationId}**.`).setColor(Discord.Colors.Orange);
                return statusMessage.edit({ embeds: [embed] });
            }

            const servers = [];

            for (const node of locationNodes) {
                await wait(250); // small delay for rate limiting
                const detailedNode = await axios({
                    url: `${config.pterodactyl.host}/api/application/nodes/${node.attributes.id}`,
                    method: 'GET',
                    params: { include: 'servers' },
                    headers: {
                        Authorization: `Bearer ${config.pterodactyl.adminApiKey}`,
                        'Content-Type': 'application/json',
                        Accept: 'Application/vnd.pterodactyl.v1+json',
                    },
                });

                const serverData = detailedNode.data?.attributes?.relationships?.servers?.data || [];
                serverData.forEach((srv) => {
                    if (srv?.attributes?.identifier) {
                        servers.push({
                            identifier: srv.attributes.identifier,
                            name: srv.attributes.name,
                        });
                    }
                });
            }

            if (servers.length === 0) {
                embed.setDescription(`No servers found in location **${locationId}**.`).setColor(Discord.Colors.Orange);
                return statusMessage.edit({ embeds: [embed] });
            }

            summary.totalServers = servers.length;
            embed.setDescription(`Sending power off signals to **${summary.totalServers}** servers...`);
            await statusMessage.edit({ embeds: [embed] });

            for (const server of servers) {
                await wait(500); // avoid hitting API rate limits
                try {
                    await axios({
                        url: `${config.pterodactyl.host}/api/client/servers/${server.identifier}/power`,
                        method: 'POST',
                        data: { signal: 'stop' },
                        headers: {
                            Authorization: `Bearer ${config.pterodactyl.clientAPI}`,
                            'Content-Type': 'application/json',
                            Accept: 'Application/vnd.pterodactyl.v1+json',
                        },
                    });
                    summary.stopSent += 1;
                } catch (err) {
                    summary.failed += 1;
                }

                await wait(500);
                try {
                    await axios({
                        url: `${config.pterodactyl.host}/api/client/servers/${server.identifier}/power`,
                        method: 'POST',
                        data: { signal: 'kill' },
                        headers: {
                            Authorization: `Bearer ${config.pterodactyl.clientAPI}`,
                            'Content-Type': 'application/json',
                            Accept: 'Application/vnd.pterodactyl.v1+json',
                        },
                    });
                    summary.killSent += 1;
                } catch (err) {
                    summary.failed += 1;
                }
            }

            embed
                .setColor(Discord.Colors.Green)
                .setTitle('Power off complete')
                .setDescription(`Processed **${summary.totalServers}** servers in location **${locationId}**.`)
                .setFields(
                    { name: 'Stop signals', value: summary.stopSent.toString(), inline: true },
                    { name: 'Kill signals', value: summary.killSent.toString(), inline: true },
                    { name: 'Failures', value: summary.failed.toString(), inline: true },
                );
        } catch (error) {
            embed
                .setColor(Discord.Colors.Red)
                .setTitle('Power off failed')
                .setDescription('An error occurred while powering off servers.')
                .addFields({ name: 'Error', value: error?.message || 'Unknown error' });
        }

        return statusMessage.edit({ embeds: [embed] });
    },
};
