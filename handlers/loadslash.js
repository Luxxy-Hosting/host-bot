const fs = require("fs");
const config = require('../config.json')

/**
 * Load SlashCommands
 */
 const loadSlashCommands = async function (client) {
    let slash = []

    const commandFolders = fs.readdirSync("./slashCommands");
    for (const folder of commandFolders) {
        const commandFiles = fs
        .readdirSync(`./slashCommands/${folder}`)
        .filter((file) => file.endsWith(".js"));
        
        for (const file of commandFiles) {
            const command = require(`../slashCommands/${folder}/${file}`);
            
            if (command.name) {
                client.slash.set(command.name, command);
                slash.push(command)
                console.log(`SlashCommand ${file} is being loaded `);
            } else {
                console.log(`❌ SlashCommand ${file} missing a help.name or help.name is not in string `);
                continue;
            }
        }
    }

    client.on("ready", async() => {
        // Register Slash Commands for a single guild
        await client.guilds.cache
           .get(config.settings.guildID)
           .commands.set(slash);

        // Register Slash Commands for all the guilds
        //await client.application.commands.set(slash)
    })
}

module.exports = {
    loadSlashCommands
}