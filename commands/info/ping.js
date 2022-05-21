const Discord = require('discord.js')
module.exports = {
    name: "ping",
    aliases: [''], 
    async run(client, message, args){
        let created = message.createdTimestamp
        message.channel.send(`pinging...`).then(msg => {
            const ping = msg.createdAt - message.createdAt;
            const api_ping = client.ws.ping;
            msg.edit({
                content: null,
                embeds:[
                    new Discord.MessageEmbed()
                    .setAuthor(`${message.author.tag}`, message.author.displayAvatarURL())
                    .setColor(client.embedColor)
                    .addField('Bot Ping', `\`\`\`ini\n[ ${ping}ms ]\n\`\`\``, true)
                    .addField('Api Ping', `\`\`\`ini\n[ ${api_ping}ms ]\n\`\`\``, true)
                    .setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL())
                    .setTimestamp()
                ]
            })
        })
    }
}