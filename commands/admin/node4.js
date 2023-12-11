const Discord = require('discord.js')
const axios = require('axios')

module.exports = {
    name: "node4",
    category: "admin",
    description: "nah",
    aliases: ['n4'],
    run: async (client, message, args) => {
        await axios.get("https://n2.luxxy.host:997/api/v1/stats").then(e => {
            let name = e.data.name
            let uptime = e.data.uptime
            let network_rx = e.data.network_rx
            let network_tx = e.data.network_tx
            let cpuusage = e.data.cpu
            let memory_total = e.data.memory_total
            let memory_used = e.data.memory_used
            let disk_total = e.data.disk_total
            let disk_used = e.data.disk_used
            let ping = e.data.ping
            let servers = e.data.servers
            let servers_running = e.data.serversrunning
            let servers_stopped = e.data.serversstopped
            
            axios.get('https://n4.luxxy.host:997/api/v1/stats/network').then(fuck => {
                
                
            const embed = new Discord.EmbedBuilder()
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ format: 'png', size: 1024, dynamic: true }) })
            .addFields(
                { name: `Hostname:`, value: name, inline: true }
            )
            .addFields(
                { name: `Uptime:`, value: uptime, inline: true }
            )
            .addFields(
                { name: `Network Total:`, value: `Download: ${formatBytes(network_rx)} \nUpload: ${formatBytes(network_tx)}`, inline: true }
            )
            .addFields(
                { name: `Cpu Usage:`, value: `${cpuusage}%`, inline: true }
            )
            .addFields(
                { name: `Memory Usage:`, value: `${formatBytes(memory_used)}/${formatBytes(memory_total)}`, inline: true }
            )
            .addFields(
                { name: `Disk Usage:`, value: `${formatBytes(disk_used)}/${formatBytes(disk_total)}`, inline: true }
                )
            .addFields(
                { name: `Server Ping:`, value: `${ping}ms`, inline: true }
            )
            .addFields(
                { name: `Servers Running`, value: `${servers_running}/${servers}`, inline: true }
                )
            .setColor('Blurple')
            .setTimestamp()
            .addFields(
                { name: 'Network Speed Usage', value: `${formatBytes(fuck.data.network_rx_sec)}/${formatBytes(fuck.data.network_tx_sec)}` }
            )
                
                message.reply({embeds: [embed]})
            })
            })
        }
}
const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
function formatBytes(x) {
    let l = 0, n = parseInt(x, 10) || 0;

    while(n >= 1024 && ++l){
        n = n/1024;
    }
    
    return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}
