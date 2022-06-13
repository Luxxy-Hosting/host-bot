const Discord = require('discord.js')
const ping = require('ping')
module.exports = {
    name: "stats",
    aliases: [''],
    
    async run(client, message, args) {
        const node1ping = await ping.promise.probe('https://n1.luxxy.host:8080')
        const node2ping = await ping.promise.probe('https://n2.luxxy.host:8080')
        const node1online = node1ping.alive
        const node2online = node2ping.alive
        const node11 = node1online ? 'Offline' : 'Online'
        const node22 = node2online ? 'Offline' : 'Online'

        const embed = new Discord.MessageEmbed()
        .setColor('#ff0000')
        .addField('Status', node11)
        .addField('Ping', node1ping.time)
        .addField('Node 2', node22)
        .addField('Ping', node2ping.time)

        message.channel.send({ embeds: [embed] })
    }
}
