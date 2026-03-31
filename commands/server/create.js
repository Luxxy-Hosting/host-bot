const config = require('../../config.json');
const { ContainerBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const userData = require('../../models/userData');
const serverData = require('../../models/serverData');
const { C, V2, errorMsg, successMsg, loadingMsg, infoMsg, textContainer } = require('../../helpers/components');

const locations = config.locations;

module.exports = async (client, message, args) => {
    const user = message.author;
    if (!serverCount.get(user.id)) {
        await serverCount.set(user.id, {
            gameused: 0,
            botused: 0,
            gamehave: 1,
            bothave: 2
        });
    }

    const userDB = await userData.findOne({ ID: user.id });
    if (!userDB) return message.reply({ components: [errorMsg('No Account', `You don't have an account. Type \`${config.bot.prefix}user new\` to create one.`)], ...V2 });

    if (!args[1] || args[1]?.toLowerCase() === 'list') {
        const panelButton = new ButtonBuilder().setStyle(ButtonStyle.Link).setURL('https://panel.luxxy.cloud').setLabel("Open Panel");

        const listContainer = new ContainerBuilder()
            .setAccentColor(C.Blurple)
            .addTextDisplayComponents(td => td.setContent(`## 🖥️ Server Types Available`))
            .addSeparatorComponents(sep => sep.setDivider(true))
            .addTextDisplayComponents(td => td.setContent(
                `**🤖 Discord Bots**\n> NodeJS • Python • AIO • Bun\n\n` +
                `**🗄️ Databases**\n> MongoDB • Redis\n\n` +
                `**🌐 Web**\n> Nginx • Uptime-Kuma\n\n` +
                `**🎮 Minecraft**\n> Paper • Purpur • Bedrock • PocketmineMP • Fabric • Vanillamc • Hytale\n\n` +
                `**📦 Other**\n> BeamMP • Teamspeak • Codeserver`
            ))
            .addSeparatorComponents(sep => sep.setDivider(true))
            .addTextDisplayComponents(td => td.setContent(`-# Example: \`${config.bot.prefix}server create paper My Server Name\``))
            .addActionRowComponents(row => row.addComponents(panelButton));

        return message.channel.send({ components: [listContainer], ...V2 });
    }

    let srvname = args.slice(2).join(' ');
    let locationID = null;

    const locationContainer = new ContainerBuilder()
        .setAccentColor(C.Gold)
        .addTextDisplayComponents(td => td.setContent(`## 🌍 Choose Deployment Location`))
        .addActionRowComponents(row =>
            row.addComponents(...locations.map(loc =>
                new ButtonBuilder()
                    .setCustomId(`location_${loc.id}`)
                    .setLabel(loc.label)
                    .setStyle(ButtonStyle.Primary)
            ))
        );

    const locMsg = await message.reply({ components: [locationContainer], ...V2 });
    const filter = i => i.user.id === user.id && i.customId.startsWith('location_');
    const collector = locMsg.createMessageComponentCollector({ filter, time: 10000, max: 1 });

    collector.on('end', async collected => {
        console.log("== 1. COLLECTOR ENDED ==");
        try {
            if (!collected.size) {
                console.log("== TIMEOUT ==");
                return locMsg.edit({ components: [errorMsg('Timed Out', 'No location selected. Please try again.')], ...V2 });
            }

            const interaction = collected.first();
            console.log("== INTERACTION CUSTOM ID:", interaction.customId);
            await interaction.deferUpdate().catch(() => {});
            
            const splitContent = interaction.customId.split('_');
            console.log("== SPLIT:", splitContent);
            
            locationID = parseInt(splitContent[1]);
            console.log("== PARSED LOCATION:", locationID);

            console.log("== 2. EDITED LOCMSG ==");
            locMsg.edit({ components: [textContainer(C.Success, '✅ Location selected.')], ...V2 }).catch(e=>console.log("EditError:",e));

            if (!locationID) {
                console.log("== FATAL: LOCATION ID IS FALSY! Proceeding with fallback 1 ==");
                locationID = 1;
            }
            
            console.log("== 3. LOCATION ID:", locationID);

            const apiHeaders = {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            };

            let owner_uuid = null;
            if (userDB.consoleID && userDB.consoleID.length > 20) {
                owner_uuid = userDB.consoleID;
                console.log("== 4. FAST OWNER UUID:", owner_uuid);
            } else {
                console.log("== 4. SLOW OWNER UUID ==");
                try {
                    const uRes = await axios.get(config.pterodactyl.host + "/api/admin/users", {
                        headers: apiHeaders,
                        params: { search: userDB.username || user.username, per_page: 50 }
                    });
                    const usernameMatch = (uRes.data.users?.data || []).find(u => u.username?.toLowerCase() === (userDB.username || user.username).toLowerCase());
                    if (usernameMatch) {
                        owner_uuid = usernameMatch.uuid;
                    } else if (userDB.email) {
                        const uResE = await axios.get(config.pterodactyl.host + "/api/admin/users", {
                            headers: apiHeaders,
                            params: { search: userDB.email, per_page: 50 }
                        });
                        const emailMatch = (uResE.data.users?.data || []).find(u => u.email?.toLowerCase() === userDB.email.toLowerCase());
                        if (emailMatch) owner_uuid = emailMatch.uuid;
                    }
                } catch (err) {
                    console.error("== UUID FETCH ERR:", err.message);
                }
            }

            if (!owner_uuid) {
               console.log("== OWNER UUID IS NULL ==");
               return message.reply({ components: [errorMsg('Not Found', 'Could not find your account on the panel!')], ...V2 });
            }

            console.log("== 5. RESOLVING MODULE ==");
            let ServerData, serverType;
            try {
                const creationModule = require(`../../server_creation/${args[1]?.toLowerCase()}.js`);
                const result = creationModule(owner_uuid, srvname ? srvname : args[1], locationID);
                ServerData = result.data;
                serverType = result.serverType;
            } catch (err) {
                console.log("== MODULE ERR:", err);
                return message.reply({ components: [errorMsg('Unknown Type', `Could not find server type: \`${args[1]}\`\nType \`!server create list\` for more info.`)], ...V2 });
            }

            console.log("== 6. USAGE CHECK:", serverType);
            const usage = serverCount.get(user.id);
            if (serverType === 'gameserver' && (usage.gameused >= usage.gamehave || usage.used >= usage.have)) {
                console.log("== GAMESERVER FULL ==");
                return message.reply({ components: [errorMsg('Slots Full', 'You\'ve used all your Gameserver slots. Run `!server count`')], ...V2 });
            } else if (serverType === 'botserver' && usage.botused >= usage.bothave) {
                console.log("== BOTSERVER FULL ==");
                return message.reply({ components: [errorMsg('Slots Full', 'You\'ve used all your Bot server slots. Run `!server count`')], ...V2 });
            }

            console.log("== 7. SENDING LOADING MSG ==");
            let msg = await message.reply({ components: [loadingMsg('Creating your server...')], ...V2 });
            console.log("== 8. LOADING MSG SENT ==");

            let node_uuid = null;
            try {
                const nRes = await axios.get(config.pterodactyl.host + "/api/admin/nodes", { headers: apiHeaders });
                const locUUID = ServerData.deployment?.location_uuids?.[0] || locationID;
                const node = nRes.data.nodes?.data?.find(n => n.location?.uuid === locUUID || n.location?.id === locUUID);
                if (node) node_uuid = node.uuid;
                console.log("== 9. NODE UUID:", node_uuid);
            } catch (err) {
                console.log("== NODE FETCH ERR:", err.message);
            }

            if (!node_uuid) {
                console.log("== INIT MSG ERROR NODE ==");
                return msg.edit({ components: [errorMsg('No Node', 'Could not find an active node in this location!')], ...V2 });
            }

            let alloc_uuid = null;
            let available_allocations = [];
            try {
                const aRes = await axios.get(config.pterodactyl.host + `/api/admin/nodes/${node_uuid}/allocations/available`, { headers: apiHeaders });
                if (aRes.data.allocations?.data && aRes.data.allocations.data.length > 0) {
                    available_allocations = aRes.data.allocations.data;
                    const randIndex = Math.floor(Math.random() * available_allocations.length);
                    alloc_uuid = available_allocations[randIndex].uuid;
                }
                console.log("== 10. ALLOC UUID:", alloc_uuid);
            } catch (err) {
                console.log("== ALLOC FETCH ERR:", err.message);
            }

            if (!alloc_uuid) {
                 console.log("== ERROR NO PORTS ==");
                 return msg.edit({ components: [errorMsg('No Ports', 'The node has run out of allocations/ports!')], ...V2 });
            }

            delete ServerData.deployment;
            ServerData.node_uuid = node_uuid;
            ServerData.allocation_uuid = alloc_uuid;
            ServerData.allocation_uuids = [];

            console.log("== 11. FIRING CREATION API ==");
            
            const attemptServerCreation = async (retries = 3) => {
                for (let i = 0; i < retries; i++) {
                    try {
                        return await axios({
                            url: config.pterodactyl.host + "/api/admin/servers",
                            method: 'POST',
                            headers: apiHeaders,
                            data: ServerData,
                        });
                    } catch (error) {
                        if (error.response && error.response.status === 409 && i < retries - 1 && available_allocations.length > 0) {
                            console.log("== 409 CONFLICT, RETRYING WITH NEW ALLOC ==");
                            const newRand = Math.floor(Math.random() * available_allocations.length);
                            ServerData.allocation_uuid = available_allocations[newRand].uuid;
                            continue;
                        }
                        throw error;
                    }
                }
            };

            attemptServerCreation().then(async response => {
                console.log("== 12. CREATE SUCCESS ==");
                const serverName = srvname ? srvname : args[1];
                const serverId = response.data.server?.uuid_short || response.data.uuid_short;
                const serverAdminId = response.data.server?.uuid || response.data.uuid;

                await serverData.create({
                    ownerID: user.id,
                    serverID: serverId,
                    serverAdminID: serverAdminId,
                    serverName,
                    type: serverType
                });

                const serverButton = new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(`${config.pterodactyl.host}/server/${serverId}`)
                    .setLabel(serverName.length < 25 ? `[${serverName}] Server Link` : `Server Link`);

                const specsButton = new ButtonBuilder()
                    .setCustomId('ShowSpecs')
                    .setLabel('Show Resources')
                    .setStyle(ButtonStyle.Success);

                const resultContainer = new ContainerBuilder()
                    .setAccentColor(C.Success)
                    .addTextDisplayComponents(td => td.setContent(`## ✅ Server Created Successfully`))
                    .addSeparatorComponents(sep => sep.setDivider(true))
                    .addTextDisplayComponents(td => td.setContent(
                        `**Status:** \`${response.statusText}\`\n` +
                        `**User ID:** \`${userDB.consoleID}\`\n` +
                        `**Server ID:** \`${serverId}\`\n` +
                        `**Server Name:** \`${serverName}\`\n` +
                        `**Server Type:** \`${args[1].toLowerCase()}\`\n\n` +
                        `-# Got issues? Make a ticket in <#1164497677334085642>`
                    ))
                    .addActionRowComponents(row => row.addComponents(serverButton, specsButton));

                msg.edit({ components: [resultContainer], ...V2 });

                const logchannel = client.channels.cache.get(config.logs.createlog);
                if (logchannel) {
                    const logContainer = new ContainerBuilder()
                        .setAccentColor(C.Aqua)
                        .addTextDisplayComponents(td => td.setContent(`## 📋 Server Created`))
                        .addSeparatorComponents(sep => sep.setDivider(true))
                        .addTextDisplayComponents(td => td.setContent(
                            `**User ID:** \`${userDB.consoleID}\`\n**Server Name:** \`${serverName}\`\n**Server Type:** \`${args[1].toLowerCase()}\`\n**Server ID:** \`${serverId}\`\n**Status:** \`${response.statusText}\``
                        ));
                    logchannel.send({ components: [logContainer], ...V2 });
                }

                if (serverType === 'gameserver') serverCount.add(message.author.id + '.gameused', 1);
                else if (serverType === 'botserver') serverCount.add(message.author.id + '.botused', 1);

            }).catch(error => {
                console.log("== 12. CREATE FAILED:", error.message);
                let errorDetails = `${error}`;
                if (error.message?.includes('400')) errorDetails = `The node ran out of allocations/ports!`;
                else if (error.message?.includes('504')) errorDetails = `The node is currently offline or having issues.`;
                else if (error.message?.includes('429')) errorDetails = `Rate limited! Try again in a minute.`;

                msg.edit({ components: [errorMsg('Creation Failed', errorDetails)], ...V2 });
            });
        } catch (epicFail) {
            console.error('== SUPER EPIC FAIL ==', epicFail);
            message.channel.send("Failed in execution: " + epicFail.message);
        }
    });
};