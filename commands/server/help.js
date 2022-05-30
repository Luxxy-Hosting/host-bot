const Discord = require('discord.js');
module.exports = (client, message, args) => {
    message.channel.send({embeds:[
        new Discord.MessageEmbed()
        .setTitle(`❓ | Need help?`)
        .setColor(`RED`)
        .setDescription(`\`${config.bot.prefix}server count\` - shows how many server slots you have and used\n\`${config.bot.prefix}server create\` - create a server\n\`${config.bot.prefix}server delete\` - delete a server\n\`!${config.bot.prefix}server list\` - shows all your servers created\n\`${config.bot.prefix}server status\` - allows you to interact with the server\n\`${config.bot.prefix}server proxy\` - Proxy your server to your domain\n\`${config.bot.prefix}server unproxy\` - Delete a proxy`)
    ]})
}
