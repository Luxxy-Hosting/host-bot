const chalk = require('chalk');
const axios = require('axios');
const serverData = require('../models/serverData');
const config = require('../config.json');
const { WebhookClient, EmbedBuilder } = require('discord.js');

const logWebhook = new WebhookClient({ url: config.logs?.webhook });

module.exports = async (client) => {
    console.log(chalk.blue('[Auto-Delete Handler]') + ' Started expiration check');

    const now = new Date();
    const servers = await serverData.find({});

    for (const server of servers) {
        const timeLeft = server.expiresAt - now;

        if (timeLeft <= 0) {
            try {
                await axios.delete(`${config.pterodactyl.host}/api/application/servers/${server.serverAdminID}`, {
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                        'Accept': 'Application/vnd.pterodactyl.v1+json'
                    }
                });

                const user = await client.users.fetch(server.ownerID);
                if (user) {
                    await user.send(`🗑️ Your server **${server.serverName}** has expired and was deleted.`);
                }

                if (server.type === 'gameserver') {
                    serverCount.subtract(server.ownerID + '.gameused', 1);
                    console.log('subtract game');
                } else {
                    serverCount.subtract(server.ownerID + '.botused', 1);
                    console.log('subtract bot');
                }

                await serverData.deleteOne({ serverID: server.serverID });

                logWebhook.send({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('🔴 Server Deleted')
                            .addFields(
                                { name: 'Server Name', value: server.serverName },
                                { name: 'Server ID', value: server.serverID },
                                { name: 'Owner', value: `<@${server.ownerID}> (${server.ownerID})` }
                            )
                            .setTimestamp()
                            .setColor('Red')
                    ]
                });
            } catch (err) {
                console.error(`[AutoDelete] Failed to delete server ${server.serverID}:`, err.message);
            }

        } else if (timeLeft <= 24 * 60 * 60 * 1000 && !server.warned) {
            try {
                const user = await client.users.fetch(server.ownerID);
                if (user) {
                    await user.send(`⚠️ Your server **${server.serverName}** will expire in less than 24 hours and be deleted automatically.`);
                    server.warned = true;
                    await server.save();

                    logWebhook.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle('⚠️ Server Expiry Warning')
                                .addFields(
                                    { name: 'Server Name', value: server.serverName },
                                    { name: 'Server ID', value: server.serverID },
                                    { name: 'Owner', value: `<@${server.ownerID}> (${server.ownerID})` }
                                )
                                .setTimestamp()
                                .setColor('Yellow')
                        ]
                    });
                }
            } catch (err) {
                console.warn(`[DM Warning] Failed to warn user ${server.ownerID}:`, err.message);
            }
        }
    }
};