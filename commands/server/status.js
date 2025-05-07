// src/commands/status.js
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

module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id });
    if (!userDB) {
        return message.reply(`You don't have an account created. Type \`${config.bot.prefix}user new\` to create one.`);
    }

    args = args.slice(1);
    const server = args[0]?.split('-')[0];
    if (!server) {
        const embed = new Discord.EmbedBuilder()
            .setColor(Discord.Colors.Green)
            .addFields([
                {
                    name: '__**Server Status**__',
                    value: `What server should I display?\nCommand Format: \`${config.bot.prefix}server status <server id>\``
                }
            ]);
        return message.channel.send({ embeds: [embed] });
    }

    const msg = await message.channel.send(`Checking server \`${server}\`...`);

    try {
        const userResponse = await axios.get(`${config.pterodactyl.host}/api/application/users/${userDB.consoleID}?include=servers`, {
            headers: {
                'Authorization': `Bearer ${config.pterodactyl.adminApiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        });

        const serverData = userResponse.data.attributes.relationships.servers.data.find(s => s.attributes?.identifier === server);
        if (!serverData) return msg.edit(`:x: | Server \`${server}\` not found in your list.`);

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

        const statusMsg = await msg.edit({ content: `<@${message.author.id}>`, embeds: [embed] });

        const ws = new WebSocket(socketURL);
        const statsHistory = [];

        let interval, timeout;

        ws.on('open', () => {
            ws.send(JSON.stringify({ event: 'auth', args: [token] }));

            timeout = setTimeout(() => {
                clearInterval(interval);
                ws.close();
                embed.setFooter({ text: 'Live session ended after 2 minutes.' });
                statusMsg.edit({ embeds: [embed] });
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
                        const imgBuffer = await chartCanvas.renderToBuffer({
                            type: 'line',
                            data: {
                                labels: statsHistory.map(p => p.time),
                                datasets: [
                                    { label: 'CPU %', data: statsHistory.map(p => p.cpu), borderColor: 'red' },
                                    { label: 'RAM (MB)', data: statsHistory.map(p => p.ram), borderColor: 'blue' }
                                ]
                            },
                            options: { responsive: true, animation: false }
                        });

                        const imgPath = path.join(__dirname, `../../temp/status-${message.author.id}.png`);
                        fs.writeFileSync(imgPath, imgBuffer);

                        embed.setImage(`attachment://status-${message.author.id}.png`);
                        embed.setDescription(
                            `**Status:** \`${stats.state}\`\n` +
                            `**Uptime:** \`${format(stats.uptime)}\`\n` +
                            `**CPU:** \`${stats.cpu_absolute.toFixed(2)}%\`\n` +
                            `**RAM:** \`${pretty(stats.memory_bytes)}\`\n` +
                            `**Disk:** \`${pretty(stats.disk_bytes)}\`\n` +
                            `**Network:** ⬆️\`${pretty(stats.network_tx_bytes)}\` / ⬇️\`${pretty(stats.network_rx_bytes)}\``
                        );

                        const attachment = new Discord.AttachmentBuilder(imgPath, { name: `status-${message.author.id}.png` });
                        await statusMsg.edit({ embeds: [embed], files: [attachment] });
                    }, 5000);
                }
            }
        });

        ws.on('error', err => {
            clearTimeout(timeout);
            clearInterval(interval);
            msg.edit(`:x: | WebSocket error: ${err.message}`);
        });

        ws.on('close', () => {
            clearTimeout(timeout);
            clearInterval(interval);
        });

    } catch (err) {
        console.error(err);
        msg.edit(`:x: | Error: ${err.message}`);
    }
};