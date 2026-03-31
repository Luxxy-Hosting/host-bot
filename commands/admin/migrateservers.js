const serverData = require('../../models/serverData');
const userData = require('../../models/userData');
const config = require('../../config.json');
const axios = require('axios');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const HEADERS = {
    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
};

async function fetchWithRetry(url, options, maxRetries = 5) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await axios.get(url, options);
        } catch(err) {
            if (err.response && err.response.status === 429) {
                const retryAfter = parseInt(err.response.headers['retry-after'] || '60', 10);
                console.log(`  ⏳ Rate limited, waiting ${retryAfter}s...`);
                await wait(retryAfter * 1000);
            } else {
                throw err;
            }
        }
    }
    throw new Error("Max retries exceeded");
}

/**
 * Fetch ALL servers from the panel, paginated.
 * Returns a flat array of every server object.
 */
async function fetchAllPanelServers() {
    const allServers = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
        console.log(`[Panel] Fetching servers page ${page}...`);
        const res = await fetchWithRetry(
            `${config.pterodactyl.host}/api/admin/servers`,
            { headers: HEADERS, params: { per_page: 100, page } }
        );

        const serversData = res.data?.servers;
        if (!serversData) break;

        const items = serversData.data || [];
        allServers.push(...items);

        totalPages = Math.ceil(serversData.total / serversData.per_page);
        console.log(`[Panel] Page ${page}/${totalPages}: got ${items.length} servers (total: ${serversData.total})`);

        page++;
        if (page <= totalPages) await wait(2000); // rate limit respect
    }

    return allServers;
}

module.exports = {
    name: "migrateservers",
    aliases: ['ms'], 
    async run(client, message, args){
        if(!message.member.roles.cache.has(config.roleID.administrator)) 
            return message.channel.send('You do not have the required permissions to use this command.');
        
        let msg = await message.reply("Fetching all servers from panel... This may take a moment.");
        
        try {
            // Step 1: Fetch ALL servers from the panel
            const panelServers = await fetchAllPanelServers();
            console.log(`\n[Panel] Total servers fetched: ${panelServers.length}`);

            // Step 2: Build lookup maps
            // Map by uuid_short for direct matching
            const byShortId = new Map();
            // Map by owner_uuid -> array of servers (for name matching)
            const byOwner = new Map();

            for (const srv of panelServers) {
                byShortId.set(srv.uuid_short, srv);
                
                const ownerUuid = srv.owner?.uuid;
                if (ownerUuid) {
                    if (!byOwner.has(ownerUuid)) byOwner.set(ownerUuid, []);
                    byOwner.get(ownerUuid).push(srv);
                }
            }

            // Step 3: Load DB data
            const dbServers = await serverData.find({});
            const toUpdate = dbServers.filter(s => s.serverAdminID && !s.serverAdminID.includes('-'));

            // Build set of existing serverIDs to avoid duplicate key errors
            const existingServerIDs = new Set(dbServers.map(s => s.serverID));

            // Track which panel servers are already matched to avoid double-matching
            const matchedPanelUuids = new Set();

            // Load user data to map discord ownerID -> panel UUID
            const allUsers = await userData.find({});
            const userMap = new Map(); // discord ID -> consoleID (panel UUID)
            for (const u of allUsers) {
                if (u.ID && u.consoleID) userMap.set(u.ID, u.consoleID);
            }

            console.log(`\n========== SERVER MIGRATION ==========`);
            console.log(`Panel servers: ${panelServers.length}`);
            console.log(`DB servers total: ${dbServers.length}`);
            console.log(`Needing migration: ${toUpdate.length}`);
            console.log(`User lookup entries: ${userMap.size}`);
            console.log(`=======================================\n`);

            await msg.edit(`Found ${toUpdate.length} servers needing migration. Panel has ${panelServers.length} servers. Starting...`);
            
            let success = 0;
            let failed = 0;
            let notFound = 0;
            let noOwner = 0;
            let dupes = 0;
            const failedServers = [];

            for (let i = 0; i < toUpdate.length; i++) {
                const s = toUpdate[i];
                console.log(`[Migrate ${i+1}/${toUpdate.length}] "${s.serverName}" | serverID: ${s.serverID} | adminID: ${s.serverAdminID} | owner: ${s.ownerID}`);

                // Strategy 1: Direct lookup by serverID (uuid_short)
                let panelServer = byShortId.get(s.serverID);
                if (panelServer && !matchedPanelUuids.has(panelServer.uuid)) {
                    console.log(`  ✓ Matched by short ID: ${s.serverID} -> ${panelServer.uuid}`);
                    matchedPanelUuids.add(panelServer.uuid);
                    s.serverAdminID = panelServer.uuid;
                    // Only update serverID if it won't cause a duplicate
                    if (s.serverID !== panelServer.uuid_short && !existingServerIDs.has(panelServer.uuid_short)) {
                        s.serverID = panelServer.uuid_short;
                        existingServerIDs.add(panelServer.uuid_short);
                    }
                    await s.save();
                    success++;
                    continue;
                }

                // Strategy 2: Match via owner UUID + server name
                const ownerPanelUuid = userMap.get(s.ownerID);
                if (!ownerPanelUuid) {
                    console.log(`  ⚠️ No panel UUID found for discord user ${s.ownerID} - cannot match`);
                    noOwner++;
                    failedServers.push(`${s.serverName} (${s.serverID}) [no owner mapping for ${s.ownerID}]`);
                    continue;
                }

                const ownerServers = byOwner.get(ownerPanelUuid) || [];
                if (ownerServers.length === 0) {
                    console.log(`  ⚠️ Owner ${ownerPanelUuid} has 0 servers on panel`);
                    notFound++;
                    failedServers.push(`${s.serverName} (${s.serverID}) [owner has no servers]`);
                    continue;
                }

                // Try exact name match (exclude already-matched panel servers)
                const available = ownerServers.filter(ps => !matchedPanelUuids.has(ps.uuid));
                let nameMatch = available.find(ps => ps.name === s.serverName);
                // Try case-insensitive if exact fails
                if (!nameMatch) {
                    nameMatch = available.find(ps => ps.name.toLowerCase() === s.serverName.toLowerCase());
                }
                // Try partial match (panel name might have prefix like "[Free] ")
                if (!nameMatch) {
                    nameMatch = available.find(ps => 
                        ps.name.toLowerCase().includes(s.serverName.toLowerCase()) ||
                        s.serverName.toLowerCase().includes(ps.name.toLowerCase())
                    );
                }

                if (nameMatch) {
                    matchedPanelUuids.add(nameMatch.uuid);
                    // Check for duplicate serverID before updating
                    if (existingServerIDs.has(nameMatch.uuid_short) && s.serverID !== nameMatch.uuid_short) {
                        console.log(`  ✅ Matched: "${s.serverName}" -> ${nameMatch.uuid} (keeping old serverID to avoid dupe)`);
                        s.serverAdminID = nameMatch.uuid;
                        dupes++;
                    } else {
                        console.log(`  ✅ Matched by owner+name: "${s.serverName}" -> ${nameMatch.uuid} (panel name: "${nameMatch.name}")`);
                        s.serverAdminID = nameMatch.uuid;
                        s.serverID = nameMatch.uuid_short;
                        existingServerIDs.add(nameMatch.uuid_short);
                    }
                    await s.save();
                    success++;
                } else {
                    console.log(`  ❌ No match. Owner has ${ownerServers.length} servers: [${ownerServers.map(os => `"${os.name}"`).join(', ')}]`);
                    notFound++;
                    failedServers.push(`${s.serverName} (${s.serverID}) [owner: ${s.ownerID}, no name match]`);
                }

                if ((i + 1) % 50 === 0) {
                    await msg.edit(`Migrating... ${i+1}/${toUpdate.length} (✅ ${success} | 🔍 ${notFound} not found | 👤 ${noOwner} no owner | ❌ ${failed})`);
                }
            }

            console.log(`\n========== MIGRATION RESULTS ==========`);
            console.log(`Updated: ${success} (${dupes} kept old serverID to avoid dupes)`);
            console.log(`Not found on panel: ${notFound}`);
            console.log(`No owner mapping: ${noOwner}`);
            console.log(`Errors: ${failed}`);
            console.log(`========================================\n`);

            let summary = `✅ Server migration complete!\n` +
                `**Updated:** ${success}\n` +
                `**Not found on panel:** ${notFound}\n` +
                `**No owner mapping:** ${noOwner}\n` +
                `**Errors:** ${failed}`;

            if (failedServers.length > 0 && failedServers.length <= 20) {
                summary += `\n\n**Unmatched:**\n${failedServers.map(s => `• ${s}`).join('\n')}`;
            } else if (failedServers.length > 20) {
                summary += `\n\n**Unmatched (first 20 of ${failedServers.length}):**\n${failedServers.slice(0, 20).map(s => `• ${s}`).join('\n')}`;
            }

            await msg.edit(summary);

        } catch(err) {
            console.error(err);
            await msg.edit(`❌ An error occurred during migration: ${err.message}`);
        }
    }
}
