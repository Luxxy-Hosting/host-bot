const config = require('../config.json')
const { EmbedBuilder } = require('discord.js')
const axios = require('axios')
module.exports = async (client) => {
    if(!config.settings.nodeStatus) return

    setInterval(async() => {
        let channel = client.channels.cache.get(config.channelID.nodeStatus)
        let msg = (await channel.messages.fetch({limit: 10})).filter(m => m.author.id === client.user.id).last()

        let panel = ''
        let node1 = ''
        let lavalink = ''
        
        await axios({
            url: config.pterodactyl.host+"/api/admin/nodes/" + "c172eb03-78d2-4468-aa1b-c93e4aec700a" + "/servers?per_page=1000",
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(async node => {
            panel = "🟢 Online"

            await axios({
                url: config.pterodactyl.host + '/api/client/servers/' + config.settings.statusembeds.node1 + "/resources",
                method: 'GET',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            }).then(data => {
                node1 = `🟢 Online (${node.data?.servers.length}/600)`
                lavalink = `${data.data.current_state === 'running' ? `🟢 Online`: data.data.current_state === 'offline' ? `🔴 Offline` : `🔄 ${data.data.current_state}`}`
            }).catch(() => {
                lavalink = `🔴 Offline`
                node1 = `🔴 Offline (${node.data?.servers.length}/600)`
            })
            
        }).catch(err => {
            panel = '🔴 Offline'
            node1 = '🔴 Offline'
        })
        

        let embed = [
            new EmbedBuilder()
            .setTitle(`Luxxy Hosting Node Status:`)
            .setDescription(`**Node Status:**\nNode 1: ${node1}\n\nPanel: ${panel}\n\n*updating every \`${config.settings.nodeStatusDelay} seconds\`*`)
            .setColor(`#677bf9`)
            .setTimestamp()
            .setFooter({text: `Last Time Updated`})
        ]

        if(!msg) {
            channel.send({embeds: embed})
        }else {
            msg.edit({embeds: embed})
        }

    }, config.settings.nodeStatusDelay * 1000)
}