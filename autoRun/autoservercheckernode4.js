const axios = require('axios')
const config = require('../config.json')
const { WebhookClient, EmbedBuilder } = require('discord.js')
const cron = require('node-cron')

const webhook = new WebhookClient({ id: config.settings.webhook.id, token: config.settings.webhook.token });
module.exports = async (client) => {
    if (!config.settings.serverchecker) return
    console.log('checker enabled running every hour on the dot')
    cron.schedule('0 * * * *', () => {
        axios({
            url: `${config.pterodactyl.host}/api/application/nodes/10?include=servers,allocations`,
            method: 'GET',
            followRedirect: true,
        maxRedirects: 5,
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'Application/vnd.pterodactyl.v1+json',
        }
    }).then(res => {
        const serverid = res.data.attributes.relationships.servers.data.filter(server => server.attributes.identifier)
        
        for(let server of serverid){
            if (server.attributes.egg === 28 || server.attributes.egg === 45 || server.attributes.egg === 40 || server.attributes.egg === 2 || server.attributes.egg === 47 || server.attributes.egg === 5) {
                
                axios({
                    url: `${config.pterodactyl.host}/api/client/servers/${server.attributes.identifier}/resources`,
                    method: 'GET',
                    followRedirect: true,
                    maxRedirects: 5,
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                    }
                }).then(serverdata => {
                    if(serverdata.data.attributes.current_state == 'offline'){ return console.log('offline') }
                    if (serverdata.data.attributes.resources.uptime > 10800000) {
                        webhook.send(`${server.attributes.identifier} more then 3 hours ${server.attributes.egg}`)
                        axios({
                            url: `${config.pterodactyl.host}/api/client/servers/${server.attributes.identifier}/power`,
                            method: 'POST',
                            followRedirect: true,
                            maxRedirects: 5,
                            headers: {
                                'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                                'Content-Type': 'application/json',
                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                            },
                            data: {
                                "signal": "kill"
                            },
                        }).then(kille => {
                            console.log(kille)
                        }).catch(fuckfuck => console.log(fuckfuck))
                        webhook.send(`${server.attributes.identifier} kill ${server.attributes.egg}`)
                    } else {
                        return webhook.send(`${server.attributes.identifier} safe ${server.attributes.egg}`)
                    }
                    
                }).catch(e => { console.log(e) })
    } else webhook.send(`${server.attributes.identifier} not a minecraft server ${server.attributes.egg}`)
}
}).catch(() => {return console.log('uhhh- something is happening with the pannel and i cant get information about the servers')})
})
}
