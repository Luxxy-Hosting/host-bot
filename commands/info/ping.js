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
                    new Discord.EmbedBuilder()
                    .setColor(client.embedColor)
                    .addFields({ name: 'Bot Ping', value: `\`\`\`ini\n[ ${ping}ms ]\n\`\`\``, inline: true })
                    .addFields({ name: 'Api Ping', value: `\`\`\`ini\n[ ${api_ping}ms ]\n\`\`\``, inline: true })
                    .setFooter({ text: `Requested by ${message.author.tag}`, iconURL: message.author.displayAvatarURL() })
                    .setTimestamp()
                ]
            })
        })
    }
}