const Discord = require('discord.js');
module.exports = (client, message, args) => {
    message.channel.send({embeds:[
        new Discord.MessageEmbed()
        .setTitle(`❓ | Need help?`)
        .setColor(`RED`)
        .setDescription(`\`!server count\` - shows how many server slots you have and used\n\`!server create\` - create a server\n\`!server delete\` - delete a server\n\`!server list\` - shows all your servers created\n\`!server status\` - allows you to interact with the server\n\`!server proxy\` - Proxy your server to your domain\n\`!server unproxy\` - Delete a proxy`)
    ]})
}