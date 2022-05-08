const chalk = require('chalk')
const config = require('../config.json')
const fs = require('fs')
const { default: axios } = require('axios')
module.exports = async (client) => {
    console.log(chalk.hex('#6b7dfb')(`Luxxy Hosting`))
    console.log(`Logged in as: ${chalk.underline(client.user.tag)}`)
    console.log(`Save Console: ${config.settings.consoleSave ? chalk.green('true') : chalk.red('false')}`)
    console.log(`Node Status: ${config.settings.nodeStatus ? chalk.green('true') : chalk.red('false')}`)
    console.log(`Maintenance mode: ${config.settings.maintenance ? chalk.green('true ') : chalk.red('false')}`)
    console.log(`Auto Leave Guilds: ${config.settings.autoLeave ? chalk.green('true') : chalk.red('false')}`)
    console.log(`Minecraft Port Checker: ${config.settings.McScript ? chalk.green('true') : chalk.red('false')}`)
    console.log()

    config.settings.maintenance ? client.user.setActivity(config.settings.statusOnMaintenance) : client.user.setActivity("!help | Luxxy Hosting", { type: "WATCHING" })

    const autorun = fs.readdirSync(`./autoRun`).filter(file => file.endsWith('.js'));
    autorun.forEach(file => {
        require(`../autoRun/${file}`)(client)
    });

    setInterval(() => {
        let guild = client.guilds.cache.get("941026456396509244");
        let membercount3 = guild.members.cache.size.toLocaleString();
        client.channels.cache.get(config.voiceID.members).edit({ 
            name: `Total Members: ${membercount3}`
        })

        axios({
            url: config.pterodactyl.host + "/api/application/servers",
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then(response => {
            client.channels.cache.get(config.voiceID.servers).edit({ 
                name: `Total Servers: ${response.data.meta.pagination.total.toLocaleString()} Servers`
            })
        })

        axios({
            url: config.pterodactyl.host + "/api/application/users",
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then(response => {
            client.channels.cache.get(config.voiceID.clients).edit({ 
                name: `Total Users: ${response.data.meta.pagination.total.toLocaleString()} Users`
            })
        })    
        console.log('voice channels updated')    
    }, 60000);

    if(config.settings.autoLeave) client.guilds.cache.forEach(g => {
        if(g.id === config.settings.guildID) return
        g.leave().catch(console.error)
    })
}