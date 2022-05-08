const Discord = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.support)) return message.channel.send('You do not have the required permissions to use this command.');
    const commands = fs.readdirSync('./commands/staff/');
    message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setDescription(` __**Staff Commands**__\n\n ${commands.map(x => `\`\`\`${x}\`\`\``).join('\n')}`)
            .setColor(`GREEN`)
        ]
    })
}