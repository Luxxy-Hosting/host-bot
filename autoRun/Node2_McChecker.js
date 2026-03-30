const config = require('../config.json')
const pinger = require('minecraft-pinger')
const wait = require('node:timers/promises').setTimeout;
const axios = require('axios')
const chalk = require('chalk')
const Discord = require('discord.js')
module.exports = async (client) => {
    if(!config.settings.McScript) return

    async function runeverything () {
        console.log(`${chalk.blue('[ Security ]')}`+" Minecraft Port Checker started :D")
        let data = (await axios({
            url: config.pterodactyl.host+"/api/admin/nodes/" + "19bd6297-0400-473d-ac4d-1ea8004156f6" + "/servers?per_page=1000",
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).catch(() => {return console.log('uhhh- something is happening with the pannel and i cant get information about the servers and allocations')}))?.data

        
        let servers = data?.servers?.data?.filter(server => !config.settings.avoidServerPorts.includes(server?.allocation?.port)) || []

        for(let server of servers){
            await wait(3000)
            let allocation = server.allocation; if(!allocation) continue;
            console.log(chalk.red('[ Security ]')+` Checking ${server.name} on port ${allocation.port}`+ ` Node: 2`)
            let mc = await pinger.pingPromise('n2.luxxy.host', allocation.port).catch(()=>{})
            if(mc) {

                let user = (await axios({
                    url: config.pterodactyl.host + "/api/admin/users/"+ server.user,
                    method: 'GET',
                    followRedirect: true,
                    maxRedirects: 5,
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }).catch(err => {}))?.data
                console.log(`${chalk.red('[ Security ]')} Minecraft server found on port ${chalk.bold(`${allocation.port}`)}, Server ID: ${chalk.bold(`${server.uuid?.split('-')[0]}`)}, Discord ID: ${chalk.bold(`${userData.all().find(x => JSON.parse(x.data).consoleID === user?.id)}`)}`)
                await client.channels.cache.get(config.channelID.abuse).send({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setTitle(`Minecraft Server Found!`)
                        .setColor(`RED`)
                        .setDescription(``
                        + `**Server info:**\n`
                        + `Server id: \`${server.uuid?.split('-')[0]}\`\n`
                        + `Server name: \`${server.name}\`\n`
                        + `Server port: \`${allocation.port}\`\n`
                        + `Server domain: \`${allocation.alias}\`\n`
                        + `\n`
                        + `**Minecraft Stats:**\n`
                        + `Description: \`${mc.description?.text}\`\n`
                        + `Players online: \`${mc.players.online}\`\n`
                        + `Players Max: \`${mc.players.max}\`\n`
                        + `Version: \`${mc.version.name}\`\n`
                        + `Ping: \`${mc.ping} ms\`\n`
                        + `\n`
                        + `**User info:**\n`
                        + `User id: \`${user?.id}\`\n`
                        + `Username: \`${user?.username}\`\n`
                        + `Email: \`${user?.email}\`\n`
                        + `Discord id: \`${userData.all().find(x => JSON.parse(x.data).consoleID === user?.id)}\``
                        )
                    ]
                })
            }
        }
    }

    runeverything()
    setInterval(() => {
        runeverything()
    }, 21600000)
    
}