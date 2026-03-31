const { WebSocket } = require('ws');
const pretty = require('prettysize');
const format = require('format-duration');
const { ContainerBuilder, SeparatorBuilder, MediaGalleryBuilder, AttachmentBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');
const userData = require('../../models/userData');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs');
const path = require('path');
const { C, V2, errorMsg, infoMsg, loadingMsg, textContainer } = require('../../helpers/components');

const width = 600, height = 300;
const chartCanvas = new ChartJSNodeCanvas({ width, height });

module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id });
    if (!userDB) {
        return message.reply({ components: [errorMsg('No Account', `You don't have an account. Type \`${config.bot.prefix}user new\` to create one.`)], ...V2 });
    }

    args = args.slice(1);
    const server = args[0]?.split('-')[0];
    if (!server) {
        return message.channel.send({ components: [infoMsg('Server Status', `Provide a server ID:\n\`${config.bot.prefix}server status <server id>\``)], ...V2 });
    }

    const msg = await message.channel.send({ components: [loadingMsg(`Checking server \`${server}\`...`)], ...V2 });

    try {
        const userResponse = await axios.get(`${config.pterodactyl.host}/api/admin/users/${userDB.consoleID}/servers?per_page=100`, {
            headers: {
                'Authorization': `Bearer ${config.pterodactyl.adminApiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        const serverDataFound = (userResponse.data?.servers?.data || []).find(s => s?.uuid_short === server);
        if (!serverDataFound) return msg.edit({ components: [errorMsg('Not Found', `Server \`${server}\` not found in your list.`)], ...V2 });

        const serverInfoResponse = await axios.get(`${config.pterodactyl.host}/api/client/servers/${server}`, {
            headers: {
                'Authorization': `Bearer ${config.pterodactyl.clientAPI}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        const { name: srvname, node, uuid, uuid_short: identifier } = serverInfoResponse.data.server;

        const wsResp = await axios.get(`${config.pterodactyl.host}/api/client/servers/${identifier}/websocket`, {
            headers: {
                'Authorization': `Bearer ${config.pterodactyl.clientAPI}`,
                'Accept': 'application/json'
            },
            withCredentials: true
        });

        const token = wsResp.data.token;
        const socketURL = wsResp.data.url.replace(/\\/g, '');

        const infoContainer = new ContainerBuilder()
            .setAccentColor(C.Blurple)
            .addTextDisplayComponents(td => td.setContent(`## 📡 Live Server Status`))
            .addSeparatorComponents(sep => sep.setDivider(true))
            .addTextDisplayComponents(td => td.setContent(
                `**Name:** \`${srvname}\`\n` +
                `**Node:** \`${node}\`\n` +
                `**ID:** \`${uuid}\`\n\n` +
                `⏳ Fetching live metrics...`
            ));

        await msg.edit({ components: [infoContainer], ...V2 });

        const ws = new WebSocket(socketURL);
        const statsHistory = [];
        let interval, timeout;

        ws.on('open', () => {
            ws.send(JSON.stringify({ event: 'auth', args: [token] }));

            timeout = setTimeout(() => {
                clearInterval(interval);
                ws.close();
                const endContainer = new ContainerBuilder()
                    .setAccentColor(C.DarkGrey)
                    .addTextDisplayComponents(td => td.setContent(`## 📡 Server Status — Session Ended`))
                    .addSeparatorComponents(sep => sep.setDivider(true))
                    .addTextDisplayComponents(td => td.setContent(`**Name:** \`${srvname}\`\n-# Live session ended after 2 minutes.`));
                msg.edit({ components: [endContainer], ...V2 });
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

                        const stateEmoji = stats.state === 'running' ? '🟢' : stats.state === 'offline' ? '🔴' : '🟡';
                        const liveContainer = new ContainerBuilder()
                            .setAccentColor(stats.state === 'running' ? C.Success : C.Error)
                            .addTextDisplayComponents(td => td.setContent(`## 📡 Live Server Status`))
                            .addSeparatorComponents(sep => sep.setDivider(true))
                            .addTextDisplayComponents(td => td.setContent(
                                `**Name:** \`${srvname}\` • **Node:** \`${node}\`\n` +
                                `${stateEmoji} **Status:** \`${stats.state}\`\n` +
                                `⏱️ **Uptime:** \`${format(stats.uptime)}\`\n` +
                                `🖥️ **CPU:** \`${stats.cpu_absolute.toFixed(2)}%\`\n` +
                                `🧠 **RAM:** \`${pretty(stats.memory_bytes)}\`\n` +
                                `💾 **Disk:** \`${pretty(stats.disk_bytes)}\`\n` +
                                `🌐 **Network:** ⬆️\`${pretty(stats.network_tx_bytes)}\` / ⬇️\`${pretty(stats.network_rx_bytes)}\``
                            ));

                        const gallery = new MediaGalleryBuilder().addItems(
                            item => item.setURL(`attachment://status-${message.author.id}.png`).setDescription('CPU & RAM usage chart')
                        );

                        const attachment = new AttachmentBuilder(imgPath, { name: `status-${message.author.id}.png` });
                        await msg.edit({ components: [liveContainer, gallery], files: [attachment], ...V2 });
                    }, 5000);
                }
            }
        });

        ws.on('error', err => {
            clearTimeout(timeout);
            clearInterval(interval);
            msg.edit({ components: [errorMsg('WebSocket Error', err.message)], ...V2 });
        });

        ws.on('close', () => {
            clearTimeout(timeout);
            clearInterval(interval);
        });

    } catch (err) {
        console.error(err);
        msg.edit({ components: [errorMsg('Error', err.message)], ...V2 });
    }
};