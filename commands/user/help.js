const Discord = require('discord.js');
const config = require('../../config.json')
module.exports = (client, message, args) => {
    message.channel.send({
        embeds:[
            new Discord.EmbedBuilder()
            .setTitle(`❓ | Need help?`)
            .setColor(Discord.Colors.Red)
            .setDescription(`\`${config.bot.prefix}user new\` - create an account\n\`${config.bot.prefix}user delete\` - unlink an account\n\`${config.bot.prefix}user link\` - shows info about your account\n\`${config.bot.prefix}user password\` - reset your password\n\``)    
        ]
    })
}