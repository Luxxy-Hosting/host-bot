const { ContainerBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const { C, V2, errorMsg } = require('../../helpers/components');

module.exports = {
    name: "node4",
    category: "admin",
    description: "nah",
    aliases: ['n4'],
    run: async (client, message, args) => {
        await axios.get("https://n2.luxxy.host:997/api/v1/stats").then(e => {
            let name = e.data.name;
            let uptime = e.data.uptime;
            let network_rx = e.data.network_rx;
            let network_tx = e.data.network_tx;
            let cpuusage = e.data.cpu;
            let memory_total = e.data.memory_total;
            let memory_used = e.data.memory_used;
            let disk_total = e.data.disk_total;
            let disk_used = e.data.disk_used;
            let ping = e.data.ping;
            let servers = e.data.servers;
            let servers_running = e.data.serversrunning;
            
            axios.get('https://n4.luxxy.host:997/api/v1/stats/network').then(fuck => {
                const container = new ContainerBuilder()
                    .setAccentColor(C.Blurple)
                    .addTextDisplayComponents(td => td.setContent(`## 🖥️ Node 4 Status`))
                    .addSeparatorComponents(sep => sep.setDivider(true))
                    .addTextDisplayComponents(td => td.setContent(
                        `**Hostname:** \`${name}\`\n` +
                        `**Uptime:** \`${uptime}\`\n` +
                        `**Ping:** \`${ping}ms\`\n` +
                        `**Servers Running:** \`${servers_running}/${servers}\`\n` +
                        `**Cpu Usage:** \`${cpuusage}%\`\n` +
                        `**Memory Usage:** \`${formatBytes(memory_used)}/${formatBytes(memory_total)}\`\n` +
                        `**Disk Usage:** \`${formatBytes(disk_used)}/${formatBytes(disk_total)}\`\n` +
                        `**Network Total:** ⬇️ \`${formatBytes(network_rx)}\` / ⬆️ \`${formatBytes(network_tx)}\`\n` +
                        `**Network Speed:** ⬇️ \`${formatBytes(fuck.data.network_rx_sec)}/s\` / ⬆️ \`${formatBytes(fuck.data.network_tx_sec)}/s\``
                    ));
                    
                message.reply({ components: [container], ...V2 });
            }).catch(err => {
                message.reply({ components: [errorMsg('Error', `Network fetch error: ${err}`)], ...V2 });
            });
        }).catch(err => {
            message.reply({ components: [errorMsg('Error', `Node stats fetch error: ${err}`)], ...V2 });
        });
    }
};

const units = ['bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
function formatBytes(x) {
    let l = 0, n = parseInt(x, 10) || 0;
    while(n >= 1024 && ++l){
        n = n/1024;
    }
    return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}
