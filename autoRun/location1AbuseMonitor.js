const axios = require('axios');
const cron = require('node-cron');
const { EmbedBuilder, Colors } = require('discord.js');
const { getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const config = require('../config.json');

const LOCATION_ID = 1;
const LOG_CHANNEL_ID = '1387858714027098163';
const ALERT_SOUND = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
const SUSPICIOUS_KEYWORDS = ['xmrig', 'miner', 'botnet', 'stress', 'ddos', 'udp', 'attack', 'crypto'];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const bytesToMB = (bytes = 0) => Math.round(bytes / 1024 / 1024);

const playAlertSound = (client) => {
    try {
        const connection = getVoiceConnection(config.settings.guildID);
        if (!connection) return;

        const player = createAudioPlayer();
        const resource = createAudioResource(ALERT_SOUND);

        player.on('error', (error) => console.error('[Voice Alert] Playback error:', error.message));
        connection.subscribe(player);
        player.play(resource);

        player.once(AudioPlayerStatus.Idle, () => player.stop());
    } catch (error) {
        console.error('[Voice Alert] Failed to play alert sound:', error.message);
    }
};

const fetchServersInLocation = async () => {
    const servers = [];

    const nodesResponse = await axios({
        url: `${config.pterodactyl.host}/api/application/nodes`,
        method: 'GET',
        params: { per_page: 100 },
        headers: {
            Authorization: `Bearer ${config.pterodactyl.adminApiKey}`,
            'Content-Type': 'application/json',
            Accept: 'Application/vnd.pterodactyl.v1+json',
        },
    });

    const locationNodes = nodesResponse.data?.data?.filter((node) => node?.attributes?.location_id === LOCATION_ID) || [];

    for (const node of locationNodes) {
        await wait(400); // respect panel rate limits
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
                    id: srv.attributes.id,
                    identifier: srv.attributes.identifier,
                    name: srv.attributes.name,
                    limits: srv.attributes.limits || {},
                });
            }
        });
    }

    return servers;
};

const checkSuspiciousFiles = async (serverIdentifier) => {
    const suspiciousFindings = [];

    try {
        const listResponse = await axios({
            url: `${config.pterodactyl.host}/api/client/servers/${serverIdentifier}/files/list`,
            method: 'GET',
            params: { directory: '/' },
            headers: {
                Authorization: `Bearer ${config.pterodactyl.clientAPI}`,
                'Content-Type': 'application/json',
                Accept: 'Application/vnd.pterodactyl.v1+json',
            },
        });

        const files = listResponse.data?.data || [];
        const flaggedFiles = files.filter((file) => file?.attributes?.is_file && SUSPICIOUS_KEYWORDS.some((keyword) => file.attributes.name.toLowerCase().includes(keyword)));

        for (const file of flaggedFiles.slice(0, 3)) { // keep content checks light
            await wait(300);
            try {
                const contentResponse = await axios({
                    url: `${config.pterodactyl.host}/api/client/servers/${serverIdentifier}/files/contents`,
                    method: 'GET',
                    params: { file: `/${file.attributes.name}` },
                    headers: {
                        Authorization: `Bearer ${config.pterodactyl.clientAPI}`,
                        'Content-Type': 'application/json',
                        Accept: 'Application/vnd.pterodactyl.v1+json',
                    },
                    timeout: 5000,
                });

                const snippet = (contentResponse.data || '').toString().slice(0, 200).toLowerCase();
                const contentKeyword = SUSPICIOUS_KEYWORDS.find((keyword) => snippet.includes(keyword));
                if (contentKeyword) {
                    suspiciousFindings.push({
                        name: file.attributes.name,
                        reason: `Keyword match in content: ${contentKeyword}`,
                    });
                } else {
                    suspiciousFindings.push({
                        name: file.attributes.name,
                        reason: 'Suspicious filename',
                    });
                }
            } catch (error) {
                suspiciousFindings.push({
                    name: file.attributes.name,
                    reason: `Could not read content (${error?.response?.status || error.message})`,
                });
            }
        }
    } catch (error) {
        console.error(`[Abuse Monitor] Failed to list files for ${serverIdentifier}:`, error.message);
    }

    return suspiciousFindings;
};

const checkServerUsage = async (server) => {
    const issues = [];

    try {
        const resourceResponse = await axios({
            url: `${config.pterodactyl.host}/api/application/servers/${server.id}/utilization`,
            method: 'GET',
            headers: {
                Authorization: `Bearer ${config.pterodactyl.adminApiKey}`,
                'Content-Type': 'application/json',
                Accept: 'Application/vnd.pterodactyl.v1+json',
            },
        });

        const resources = resourceResponse.data?.attributes || {};
        const limits = server.limits || {};

        if (resources.current_state === 'offline') {
            return issues;
        }

        if (limits.memory && resources.memory_bytes > limits.memory * 1024 * 1024) {
            issues.push(`Memory over limit: ${bytesToMB(resources.memory_bytes)}MB / ${limits.memory}MB`);
        }

        if (limits.disk && resources.disk_bytes > limits.disk * 1024 * 1024) {
            issues.push(`Disk over limit: ${bytesToMB(resources.disk_bytes)}MB / ${limits.disk}MB`);
        }

        if (limits.cpu && limits.cpu > 0 && resources.cpu_absolute > limits.cpu) {
            issues.push(`CPU over limit: ${resources.cpu_absolute.toFixed(1)}% / ${limits.cpu}%`);
        }
    } catch (error) {
        issues.push(`Could not fetch resources (${error?.response?.status || error.message})`);
    }

    return issues;
};

module.exports = async (client) => {
    if (!config.settings.serverchecker) return;

    console.log('[AutoRun] Location 1 abuse monitor scheduled (every hour).');

    cron.schedule('0 * * * *', async () => {
        const logChannel = client.channels.cache.get(LOG_CHANNEL_ID);
        const flaggedServers = [];

        try {
            const servers = await fetchServersInLocation();

            for (const server of servers) {
                await wait(500);
                const issues = await checkServerUsage(server);

                if (issues.length === 0) continue;

                const suspiciousFiles = await checkSuspiciousFiles(server.identifier);

                if (issues.length > 0 || suspiciousFiles.length > 0) {
                    flaggedServers.push({ ...server, issues, suspiciousFiles });
                }
            }
        } catch (error) {
            console.error('[Abuse Monitor] Failed to complete scan:', error.message);
        }

        if (!flaggedServers.length) return;

        const embed = new EmbedBuilder()
            .setTitle('Location 1 Abuse Scan')
            .setColor(Colors.Red)
            .setDescription(`Identified potential resource abuse on ${flaggedServers.length} server(s).`)
            .setTimestamp();

        flaggedServers.slice(0, 10).forEach((server) => {
            const fileNotes = server.suspiciousFiles?.map((file) => `• ${file.name} — ${file.reason}`).join('\n');
            const issueLines = server.issues.map((issue) => `• ${issue}`).join('\n');

            const details = [issueLines, fileNotes].filter(Boolean).join('\n');
            embed.addFields({
                name: server.name || server.identifier,
                value: details || 'Issues detected but no details available.',
            });
        });

        if (flaggedServers.length > 10) {
            embed.addFields({
                name: 'Additional servers',
                value: `${flaggedServers.length - 10} more server(s) flagged beyond embed limit.`,
            });
        }

        if (logChannel) {
            logChannel.send({ embeds: [embed] }).catch((err) => console.error('[Abuse Monitor] Failed to log to channel:', err.message));
        } else {
            console.warn(`[Abuse Monitor] Log channel ${LOG_CHANNEL_ID} not found.`);
        }

        playAlertSound(client);
    });
};
