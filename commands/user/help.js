const Discord = require('discord.js');
module.exports = (client, message, args) => {
    message.channel.send({
        embeds:[
            new Discord.MessageEmbed()
            .setTitle(`❓ | Need help?`)
            .setColor(`RED`)
            .setDescription(`\`!user new\` - create an account\n\`!user delete\` - unlink an account\n\`!user link\` - shows info about your account\n\`!user password\` - reset your password`)    
        ]
    })
}