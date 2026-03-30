const userData = require('../../models/userData');
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
    name: "migrateusers",
    aliases: ['mu'], 
    async run(client, message, args){
        if(!message.member.roles.cache.has(config.roleID.administrator)) return message.channel.send('You do not have the required permissions to use this command.');
        
        let msg = await message.reply("Fetching users from database...");
        
        try {
            const users = await userData.find({});
            const toUpdate = users.filter(u => u.consoleID && u.consoleID.length < 20);
            
            await msg.edit(`Found ${toUpdate.length} users with legacy IDs out of ${users.length} total users. Beginning API migration... This may take a few minutes.`);
            
            let success = 0;
            let failed = 0;

            for (let i = 0; i < toUpdate.length; i++) {
                const u = toUpdate[i];
                try {
                    let uRes = await fetchWithRetry(config.pterodactyl.host + "/api/admin/users", {
                        headers: { 'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey, 'Accept': 'application/json' },
                        params: { 'filter[email]': u.email }
                    });
                    
                    if (uRes.data.users?.data?.length > 0) {
                        u.consoleID = uRes.data.users.data[0].uuid;
                        await u.save();
                        success++;
                    } else {
                        let uRes2 = await fetchWithRetry(config.pterodactyl.host + "/api/admin/users", {
                            headers: { 'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey, 'Accept': 'application/json' },
                            params: { 'filter[username]': u.username }
                        });
                        if (uRes2.data.users?.data?.length > 0) {
                            u.consoleID = uRes2.data.users.data[0].uuid;
                            await u.save();
                            success++;
                        } else {
                            failed++;
                        }
                    }
                } catch(err) {
                    failed++;
                }

                await wait(1000); // 1-second delay between users to avoid instant 429s

                if ((i + 1) % 10 === 0) {
                    await msg.edit(`Migrating... Progress: ${i+1}/${toUpdate.length} (Success: ${success}, Failed: ${failed})`);
                }
            }

            await msg.edit(`✅ Migration complete! Successfully updated ${success} users to UUIDs. Failed: ${failed}.`);

        } catch(err) {
            console.error(err);
            await msg.edit(`❌ An error occurred during migration: ${err.message}`);
        }
    }
}
