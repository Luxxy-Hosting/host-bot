const Discord = require('discord.js');
const config = require('../config.json')

module.exports = async (client) => {
    if(!config.settings.lavalinkStatus) return
    const channel = client.channels.cache.get('1005974893915017227')
    let msg = (await channel.messages.fetch({limit: 10})).filter(m => m.author.id === client.user.id).last()
    
    const embed = new Discord.EmbedBuilder()
    .setColor(0x2F3136)
    .setDescription("Please wait for a minute!\nStatus is getting ready!")
    
    if(!msg) {
        channel.send({embeds: [embed]})
    }else {
        msg.edit({embeds: [embed]})
    }

    setInterval(() => {
        let all = []
        client.manager.nodes.forEach(node => {
            let info = []
            info.push(`Status: ${node.connected ? "🟢" : "🔴"}`)
            info.push(`Node: ${(node.options.identifier)}`)
            info.push(`Player: ${node.stats.players}`)
            info.push(`Playing Players: ${node.stats.playingPlayers}`)
            info.push(`Uptime: ${new Date(node.stats.uptime).toISOString().slice(11, 19)}`)
            info.push("\nCPU")
            info.push(`Cores: ${node.stats.cpu.cores}`)
            info.push(`System Load: ${(Math.round(node.stats.cpu.systemLoad * 100) / 100).toFixed(2)}%`)
            info.push(`Lavalink Load: ${(Math.round(node.stats.cpu.lavalinkLoad * 100) / 100).toFixed(2)}%`)
            all.push(info.join('\n'))
        })
        client.manager.nodes.forEach(node => {
            const rembed = new Discord.EmbedBuilder()
            .setAuthor({ name: `Luxxy Hosting Lavalink Status`, iconURL: `${client.user.avatarURL({ size: 1024, format: 'png' })}`, url: 'https://discord.js.org' })
            .setDescription(`\`\`\`${all.join('\n\n----------------------------\n')}\n\n` + 
                    `Node          - [1]\n` +
                    `Total Memory  - [${Math.round(require('os').totalmem() / 2000/ 2000)}mb]\n` +
                    `Free Memory   - [${Math.round(require('os').freemem() / 1024 / 1024)} mb]\n` +
                    `RSS           - [${Math.round(process.memoryUsage().rss / 1024 / 1024)} mb]\n` +
                    `Heap Total    - [${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} mb]\n` +
                    `Heap Used     - [${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} mb]\n` +
                    `External      - [${Math.round(process.memoryUsage().external / 1024 / 1024)} mb]\n` +
                    `Array Buffer  - [${Math.round(process.memoryUsage().rss / 1024 / 1024)} mb]\n` +
                    `CPU Model     - [${require('os').cpus()[0].model}]\n` +
                    `Cores         - [${require('os').cpus().length}]\n` +
                    `Speed         - [${require('os').cpus()[0].speed}Mhz]\n` +
                    `Platform      - [${process.platform}]\n` +
                    `PID           - [${process.pid}]\n` +
                    `\n` + `\`\`\``)
            .setColor(0x5865F2)
            .setTimestamp(Date.now());
            msg.edit({embeds: [rembed]});
        })
    }, 10000)
}