const Discord = require('discord.js')
module.exports = async (client, message, args) => {
    const user = message.mentions.users.first() || message.author
    if(!serverCount.get(user.id)) {
        await serverCount.set(user.id, {
            used: 0,
            have: 3
        })
    }

    message.channel.send({
        embeds:[
            new Discord.MessageEmbed()
            .setTitle(`${success} ${user.username}'s Server Count`)
            .setColor(`#677bf9`)
            .setDescription(`**${user.username}** have used \`${serverCount.get(user.id).used}/${serverCount.get(user.id).have}\` servers`)
        ]
    })
}