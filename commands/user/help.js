const Discord = require('discord.js');
module.exports = (client, message, args) => {
    message.channel.send({
        embeds:[
            new Discord.MessageEmbed()
            .setTitle(`❓ | Need help?`)
            .setColor(`RED`)
            .setDescription(`\`${config.bot.prefix}user new\` - create an account\n\`${config.bot.prefix}user delete\` - unlink an account\n\`${config.bot.prefix}user link\` - shows info about your account\n\`${config.bot.prefix}user password\` - reset your password\n\`${config.bot.prefix}user switchdbs\` - switch your user database to the mongodb datababse`)    
        ]
    })
}
