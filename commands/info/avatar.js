const Discord = require('discord.js')


module.exports = {
    name: "avatar",
    aliases: ['av'],
    
    async run(client, message, args) {
        const user = message.mentions.users.first() || message.author
        const avatar = user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 })

        message.reply({
            embeds: [
                new Discord.MessageEmbed()
                .setColor('#ff0000')
                .setTitle(`${user.username}'s avatar`)
                .setDescription(`🖼 [Link to avatar](${avatar})`)
                .setImage(avatar)
            ]
        })
    }
}