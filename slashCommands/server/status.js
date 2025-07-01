const { WebSocket } = require('ws');
const pretty = require('prettysize');
const format = require('format-duration');
const Discord = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');
const userData = require('../../models/userData');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');

const width = 600, height = 300;
const chartCanvas = new ChartJSNodeCanvas({ width, height });

module.exports = {
    name: "status",
    category: "server",
    description: "Show live server status and metrics",
    options: [
        {
            name: "server_id",
            description: "The ID of the server to check status",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    ownerOnly: false,
    run: async (client, interaction) => {
        const userDB = await userData.findOne({ ID: interaction.user.id });
        if (!userDB) {
            return interaction.reply(`You don't have an account created. Use \`/user new\` to create one.`);
        }

        const server = interaction.options.getString('server_id')?.split('-')[0];
        if (!server) {
            return interaction.reply("Please provide a valid server ID.");
        }

        await interaction.reply(`Checking server \`${server}\`...`);

        try {
            const userResponse = await axios.get(`${config.pterodactyl.host}/api/application/users/${userDB.consoleID}?include=servers`, {
                headers: {
                    'Authorization': `Bearer ${config.pterodactyl.adminApiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                },
            });

            const serverData = userResponse.data.attributes.relationships.servers.data.find(s => s.attributes?.identifier === server);
            if (!serverData) return interaction.editReply(`:x: | Server \`${server}\` not found in your list.`);

            const serverInfoResponse = await axios.get(`${config.pterodactyl.host}/api/client/servers/${server}`, {
                headers: {
                    'Authorization': `Bearer ${config.pterodactyl.clientAPI}`,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                },
            });

            const { name: srvname, node, uuid, identifier } = serverInfoResponse.data.attributes;

            const wsResp = await axios.get(`${config.pterodactyl.host}/api/client/servers/${identifier}/websocket`, {
                headers: {
                    'Authorization': `Bearer ${config.pterodactyl.clientAPI}`,
                    'Accept': 'application/json'
                },
                withCredentials: true
            });

            const token = wsResp.data.data.token;
            const socketURL = wsResp.data.data.socket.replace(/\\/g, '');

            const embed = new Discord.EmbedBuilder()
                .setTitle('Live Server Status')
                .setColor(Discord.Colors.Blurple)
                .setDescription('Fetching live metrics...')
                .addFields([
                    { name: 'Name', value: `\`${srvname}\``, inline: true },
                    { name: 'Node', value: `\`${node}\``, inline: true },
                    { name: 'Full ID', value: `\`${uuid}\``, inline: false },
                ]);

            await interaction.editReply({ content: `<@${interaction.user.id}>`, embeds: [embed] });

            const ws = new WebSocket(socketURL);
            const statsHistory = [];

            let interval, timeout;

            ws.on('open', () => {
                ws.send(JSON.stringify({ event: 'auth', args: [token] }));

                timeout = setTimeout(() => {
                    clearInterval(interval);
                    ws.close();
                    embed.setFooter({ text: 'Live session ended after 2 minutes.' });
                    interaction.editReply({ embeds: [embed] });
                }, 2 * 60 * 1000);
            });

            ws.on('message', async (data) => {
                const packet = JSON.parse(data);
                if (packet.event === 'stats') {
                    const stats = JSON.parse(packet.args[0]);
                    statsHistory.push({
                        cpu: stats.cpu_absolute,
                        ram: stats.memory_bytes / 1024 / 1024,
                        time: new Date().toLocaleTimeString(),
                    });

                    if (!interval) {
                        interval = setInterval(async () => {
                            try {
                                const imgBuffer = await chartCanvas.renderToBuffer({
                                    type: 'line',
                                    data: {
                                        labels: statsHistory.slice(-10).map(p => p.time),
                                        datasets: [
                                            { label: 'CPU %', data: statsHistory.slice(-10).map(p => p.cpu), borderColor: 'red' },
                                            { label: 'RAM (MB)', data: statsHistory.slice(-10).map(p => p.ram), borderColor: 'blue' }
                                        ]
                                    },
                                    options: { responsive: true, animation: false }
                                });

                                // Create temp directory if it doesn't exist
                                const tempDir = path.join(__dirname, '../../temp');
                                if (!fs.existsSync(tempDir)) {
                                    fs.mkdirSync(tempDir, { recursive: true });
                                }

                                const imgPath = path.join(tempDir, `status-${interaction.user.id}.png`);
                                fs.writeFileSync(imgPath, imgBuffer);

                                embed.setImage(`attachment://status-${interaction.user.id}.png`);
                                embed.setDescription(
                                    `**Status:** \`${stats.state}\`\n` +
                                    `**Uptime:** \`${format(stats.uptime)}\`\n` +
                                    `**CPU:** \`${stats.cpu_absolute.toFixed(2)}%\`\n` +
                                    `**RAM:** \`${pretty(stats.memory_bytes)}\`\n` +
                                    `**Disk:** \`${pretty(stats.disk_bytes)}\`\n` +
                                    `**Network:** ⬆️\`${pretty(stats.network_tx_bytes)}\` / ⬇️\`${pretty(stats.network_rx_bytes)}\``
                                );

                                const attachment = new Discord.AttachmentBuilder(imgPath, { name: `status-${interaction.user.id}.png` });
                                await interaction.editReply({ embeds: [embed], files: [attachment] });
                            } catch (chartErr) {
                                console.error('Chart generation error:', chartErr);
                                // Continue without chart if chart generation fails
                                embed.setDescription(
                                    `**Status:** \`${stats.state}\`\n` +
                                    `**Uptime:** \`${format(stats.uptime)}\`\n` +
                                    `**CPU:** \`${stats.cpu_absolute.toFixed(2)}%\`\n` +
                                    `**RAM:** \`${pretty(stats.memory_bytes)}\`\n` +
                                    `**Disk:** \`${pretty(stats.disk_bytes)}\`\n` +
                                    `**Network:** ⬆️\`${pretty(stats.network_tx_bytes)}\` / ⬇️\`${pretty(stats.network_rx_bytes)}\``
                                );
                                await interaction.editReply({ embeds: [embed] });
                            }
                        }, 5000);
                    }
                }
            });

            ws.on('error', err => {
                clearTimeout(timeout);
                clearInterval(interval);
                interaction.editReply(`:x: | WebSocket error: ${err.message}`);
            });

            ws.on('close', () => {
                clearTimeout(timeout);
                clearInterval(interval);
            });

        } catch (err) {
            console.error(err);
            await interaction.editReply(`:x: | Error: ${err.message}`);
        }
    }
};