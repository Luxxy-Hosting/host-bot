const axios = require('axios')
const config = require('../config.json')
const { WebhookClient, EmbedBuilder } = require('discord.js')
const cron = require('node-cron')

const webhook = new WebhookClient({ id: config.settings.webhook.id, token: config.settings.webhook.token });
module.exports = async (client) => {
    return webhook.send('disabled')
//     if (!config.settings.serverchecker) return
//     console.log('checker enabled running every hour on the dot')
//     cron.schedule('0 * * * *', () => {
//         axios({
//             url: `${config.pterodactyl.host}/api/admin/nodes/3d4188dc-42c1-4850-8119-4e2a487441f8/servers?per_page=1000`,
//             method: 'GET',
//             followRedirect: true,
//         maxRedirects: 5,
//         headers: {
//             'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//         }
//     }).then(res => {
//         const serverid = (res.data.user?.servers || res.data.user?.relationships?.servers || []).filter(server => server.uuid_short)
        
//         for(let server of serverid){
//             if (server.egg === 28 || server.egg === 45 || server.egg === 40 || server.egg === 2 || server.egg === 47 || server.egg === 5) {
                
//                 axios({
//                     url: `${config.pterodactyl.host}/api/client/servers/${server.uuid_short}/resources`,
//                     method: 'GET',
//                     followRedirect: true,
//                     maxRedirects: 5,
//                     headers: {
//                         'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
//                         'Content-Type': 'application/json',
//                         'Accept': 'application/json',
//                     }
//                 }).then(serverdata => {
//                     if(serverdata.data.current_state == 'offline'){ return console.log('offline') }
//                     if (serverdata.data.resources.uptime > 10800000) {
//                         webhook.send(`${server.uuid_short} more then 3 hours ${server.egg}`)
//                         axios({
//                             url: `${config.pterodactyl.host}/api/client/servers/${server.uuid_short}/power`,
//                             method: 'POST',
//                             followRedirect: true,
//                             maxRedirects: 5,
//                             headers: {
//                                 'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
//                                 'Content-Type': 'application/json',
//                                 'Accept': 'application/json',
//                             },
//                             data: {
//                                 "signal": "kill"
//                             },
//                         }).then(kille => {
//                             console.log(kille)
//                         }).catch(fuckfuck => console.log(fuckfuck))
//                         webhook.send(`${server.uuid_short} kill ${server.egg}`)
//                     } else {
//                         return webhook.send(`${server.uuid_short} safe ${server.egg}`)
//                     }
                    
//                 }).catch(e => { console.log(e) })
//     } else webhook.send(`${server.uuid_short} not a minecraft server ${server.egg}`)
// }
// }).catch(() => {return console.log('uhhh- something is happening with the pannel and i cant get information about the servers')})
// })
}
