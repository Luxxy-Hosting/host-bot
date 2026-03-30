const serverData = require('../../models/serverData');
const config = require('../../config.json');
const axios = require('axios');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await axios.get(url, options);
        } catch(err) {
            if (err.response && err.response.status === 429) {
                console.log(`Rate limited, waiting 45 seconds...`);
                await wait(45000);
            } else {
                throw err;
            }
        }
    }
    throw new Error("Max retries exceeded");
}

module.exports = {
    name: "migrateservers",
    aliases: ['ms'], 
    async run(client, message, args){
        if(!message.member.roles.cache.has(config.roleID.administrator)) return message.channel.send('You do not have the required permissions to use this command.');
        
        let msg = await message.reply("Fetching servers from database...");
        
        try {
            const servers = await serverData.find({});
            const toUpdate = servers.filter(s => s.serverAdminID && s.serverAdminID.length < 20);
            
            await msg.edit(`Found ${toUpdate.length} servers with legacy IDs out of ${servers.length} total servers. Beginning API migration... This may take a few minutes.`);
            
            let success = 0;
            let failed = 0;

            for (let i = 0; i < toUpdate.length; i++) {
                const s = toUpdate[i];
                try {
                    // search by uuid_short (serverID)
                    let sRes = await fetchWithRetry(config.pterodactyl.host + "/api/admin/servers/" + s.serverID, {
                        headers: { 'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey, 'Accept': 'application/json' }
                    });
                    
                    const serverInfo = sRes.data.server || sRes.data;
                    if (serverInfo && serverInfo.uuid) {
                        s.serverAdminID = serverInfo.uuid;
                        await s.save();
                        success++;
                    } else {
                        failed++;
                    }
                } catch(err) {
                    failed++;
                }

                await wait(1000); // 1-second delay between queries to avoid rate limiting

                if ((i + 1) % 10 === 0) {
                    await msg.edit(`Migrating... Progress: ${i+1}/${toUpdate.length} (Success: ${success}, Failed: ${failed})`);
                }
            }

            await msg.edit(`✅ Server migration complete! Successfully updated ${success} servers to UUIDs. Failed: ${failed}.`);

        } catch(err) {
            console.error(err);
            await msg.edit(`❌ An error occurred during migration: ${err.message}`);
        }
    }
}
