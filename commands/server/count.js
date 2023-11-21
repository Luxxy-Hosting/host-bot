const Discord = require('discord.js')
module.exports = async (client, message, args) => {
    const user = message.mentions.users.first() || message.author
    if(!serverCount.get(user.id)) {
        await serverCount.set(user.id, {
            mineused: 0,
            botused: 0,
            minehave: 1,
            bothave: 2
        })
    }

    message.channel.send({
        embeds:[
            new Discord.EmbedBuilder()
            .setTitle(`${success} ${user.username}'s Server Count`)
            .setColor(0x677bf9)
            .setDescription(`**${user.username}** \n Minecraft Servers: \`${serverCount.get(user.id).mineused}/${serverCount.get(user.id).minehave}\` \n Bot Servers: \`${serverCount.get(user.id).botused}/${serverCount.get(user.id).bothave}\` \n`)
        ]
    })
}