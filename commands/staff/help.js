const Discord = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.support)) return message.channel.send('You do not have the required permissions to use this command.');
    const commands = fs.readdirSync('./commands/staff/');
    const commandNames = commands.map(file => file.split('.')[0]);
    message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setDescription(`**__Staff Commands__**\n\n${commandNames.join(', \n')}`)
            .setColor(`GREEN`)
        ]
    })
}