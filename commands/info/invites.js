const Discord = require('discord.js')
module.exports = {
    name: "invite",
    aliases: ['invites'], 
    async run(client, message, args){
        const user = message.mentions.users.first() || message.author

        if(!invinfo.get(user.id)){
            await invinfo.set(user.id, {
                invites: 0,
                regular: 0,
                left: 0,
                sold: 0
            })
        }

        message.reply(`**${user.username}** have **${invinfo.get(user.id).invites}** invites ( **${invinfo.get(user.id).regular}** joined, **${invinfo.get(user.id).left}** left, **${invinfo.get(user.id).sold}** sold)`)
    }
}