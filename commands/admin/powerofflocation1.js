const { CommandInteraction, PermissionsBitField, ContainerBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const ServerData = require('../../models/serverData');
const config = require('../../config.json');
const { C, V2, errorMsg, successMsg, warnMsg } = require('../../helpers/components');

module.exports = {
    name: 'powerofflocation1',
    description: 'Powers off all servers deployed on Node 1 components.',

    async run(client, message, args) {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply({ components: [errorMsg('No Permission', 'You do not have permission to use this command.')], ...V2 });
        }

        try {
            const nRes = await axios.get(config.pterodactyl.host + "/api/admin/nodes", {
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            });

            const node1NodeId = 1; 
            const node = nRes.data.nodes?.data?.find(n => n.id === node1NodeId || n.location?.id === node1NodeId);
            if (!node) {
                 return message.reply({ components: [errorMsg('Not Found', 'Count not find Node 1.')], ...V2 });
            }
            const nodeUUID = node.uuid;

            const initContainer = new ContainerBuilder()
                .setAccentColor(C.Warning)
                .addTextDisplayComponents(td => td.setContent(`## ⚠️ Initiating Power Off...`))
                .addSeparatorComponents(sep => sep.setDivider(true))
                .addTextDisplayComponents(td => td.setContent(`Target: **Node 1**\nFetching servers...`));

            const msg = await message.reply({ components: [initContainer], ...V2 });

            const serversResponse = await axios.get(`${config.pterodactyl.host}/api/admin/nodes/${nodeUUID}/servers`, {
                headers: {
                    'Authorization': `Bearer ${config.pterodactyl.adminApiKey}`,
                    'Accept': 'application/json'
                }
            });

            const servers = serversResponse.data?.servers?.data || [];
            if (servers.length === 0) {
                return msg.edit({ components: [warnMsg('Empty', 'No servers found on Node 1.')], ...V2 });
            }

            msg.edit({
                components: [
                    new ContainerBuilder()
                        .setAccentColor(C.Warning)
                        .addTextDisplayComponents(td => td.setContent(`## ⚠️ Initiating Power Off...`))
                        .addSeparatorComponents(sep => sep.setDivider(true))
                        .addTextDisplayComponents(td => td.setContent(`Target: **Node 1**\nFound **${servers.length}** servers. Sending kill signals...`))
                ], 
                ...V2
            });

            let successCount = 0;
            let failCount = 0;

            for (const server of servers) {
                const serverId = server.uuid_short;

                try {
                    await axios.post(`${config.pterodactyl.host}/api/client/servers/${serverId}/power`, 
                    {
                        signal: 'kill'
                    }, 
                    {
                        headers: {
                            'Authorization': `Bearer ${config.pterodactyl.clientAPI}`,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });
                    successCount++;
                } catch (error) {
                    console.error(`Failed to power off server ${serverId}:`, error.message);
                    failCount++;
                }

                await new Promise(resolve => setTimeout(resolve, 500));
            }

            const resultContainer = new ContainerBuilder()
                .setAccentColor(C.Success)
                .addTextDisplayComponents(td => td.setContent(`## ✅ Power Off Complete`))
                .addSeparatorComponents(sep => sep.setDivider(true))
                .addTextDisplayComponents(td => td.setContent(
                    `**Node 1** servers have been killed.\n` +
                    `✅ **Success:** \`${successCount}\`\n` +
                    `❌ **Failed:** \`${failCount}\``
                ));

            msg.edit({ components: [resultContainer], ...V2 });

        } catch (error) {
            console.error('Error powering off location 1 servers:', error);
            message.reply({ components: [errorMsg('Error', `Failed to execute: ${error.message}`)], ...V2 });
        }
    }
};
