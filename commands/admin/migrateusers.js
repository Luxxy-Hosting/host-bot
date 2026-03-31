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
                const retryAfter = parseInt(err.response.headers['retry-after'] || '45', 10);
                console.log(`Rate limited, waiting ${retryAfter} seconds...`);
                await wait(retryAfter * 1000);
            } else {
                throw err;
            }
        }
    }
    throw new Error("Max retries exceeded");
}

/**
 * Search for a user on the panel by email. The Luxxy API uses a `search` 
 * query parameter (not filter[email]). Search is fuzzy, so we must do an 
 * exact email match client-side from the results.
 */
async function findPanelUserByEmail(email) {
    const res = await fetchWithRetry(
        `${config.pterodactyl.host}/api/admin/users`,
        { headers: HEADERS, params: { search: email, per_page: 50 } }
    );

    const users = res.data?.users?.data || [];
    // Exact match on email (case-insensitive)
    const match = users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    return match || null;
}

/**
 * Fallback: search by username 
 */
async function findPanelUserByUsername(username) {
    const res = await fetchWithRetry(
        `${config.pterodactyl.host}/api/admin/users`,
        { headers: HEADERS, params: { search: username, per_page: 50 } }
    );

    const users = res.data?.users?.data || [];
    const match = users.find(u => u.username?.toLowerCase() === username.toLowerCase());
    return match || null;
}

module.exports = {
    name: "migrateusers",
    aliases: ['mu'], 
    async run(client, message, args){
        if(!message.member.roles.cache.has(config.roleID.administrator)) 
            return message.channel.send('You do not have the required permissions to use this command.');
        
        let msg = await message.reply("Fetching users from database...");
        
        try {
            const users = await userData.find({});
            
            // Migrate ALL users — not just ones with short IDs, since the previous
            // migration gave everyone the same wrong UUID
            const toUpdate = users.filter(u => u.email);
            
            await msg.edit(`Found ${toUpdate.length} users with email addresses out of ${users.length} total. Beginning migration...`);
            
            let success = 0;
            let failed = 0;
            let skipped = 0;
            const failedUsers = [];

            for (let i = 0; i < toUpdate.length; i++) {
                const u = toUpdate[i];
                try {
                    console.log(`[Migrate ${i+1}/${toUpdate.length}] Processing: ${u.username || 'unknown'} (${u.email})`);

                    // Search by email first
                    let panelUser = await findPanelUserByEmail(u.email);
                    await wait(1500); // respect rate limits

                    if (panelUser) {
                        console.log(`  ✓ Found by email: ${panelUser.email} -> ${panelUser.uuid}`);
                    }

                    // Fallback to username if email doesn't match
                    if (!panelUser && u.username) {
                        console.log(`  ⚠ No email match, trying username: ${u.username}`);
                        panelUser = await findPanelUserByUsername(u.username);
                        await wait(1500);
                        if (panelUser) {
                            console.log(`  ✓ Found by username: ${panelUser.username} -> ${panelUser.uuid}`);
                        }
                    }

                    if (panelUser) {
                        // Only update if the UUID is actually different
                        if (u.consoleID !== panelUser.uuid) {
                            console.log(`  ✅ Updating consoleID: ${u.consoleID} -> ${panelUser.uuid}`);
                            u.consoleID = panelUser.uuid;
                            await u.save();
                            success++;
                        } else {
                            console.log(`  ⏭️ Already correct: ${u.consoleID}`);
                            skipped++;
                        }
                    } else {
                        console.log(`  ❌ No panel user found for ${u.email}`);
                        failed++;
                        failedUsers.push(`${u.username || 'unknown'} (${u.email})`);
                    }
                } catch(err) {
                    console.error(`  ❌ Error for ${u.username || 'unknown'}: ${err.message}`);
                    failed++;
                    failedUsers.push(`${u.username || 'unknown'} - ${err.message}`);
                }

                if ((i + 1) % 10 === 0) {
                    await msg.edit(`Migrating... Progress: ${i+1}/${toUpdate.length} (✅ ${success} | ⏭️ ${skipped} | ❌ ${failed})`);
                }
            }

            let summary = `✅ Migration complete!\n` +
                `**Updated:** ${success}\n` +
                `**Already correct:** ${skipped}\n` +
                `**Failed:** ${failed}`;

            if (failedUsers.length > 0 && failedUsers.length <= 20) {
                summary += `\n\n**Failed users:**\n${failedUsers.map(u => `• ${u}`).join('\n')}`;
            } else if (failedUsers.length > 20) {
                summary += `\n\n**Failed users (first 20):**\n${failedUsers.slice(0, 20).map(u => `• ${u}`).join('\n')}`;
            }

            await msg.edit(summary);

        } catch(err) {
            console.error(err);
            await msg.edit(`❌ An error occurred during migration: ${err.message}`);
        }
    }
}
