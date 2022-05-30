const Discord = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.support)) return message.channel.send('You do not have the required permissions to use this command.');
    const commands = fs.readdirSync('./commands/staff/');
    const push = [];
    for (let i = 0; i < commands.length; i++) {
        let command = commands[i].split('.')[0];
        push.push(command);
    }
    message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setTitle('__**Staff Commands**__')
            .setDescription(`**${config.bot.prefix}${push.join(`, ${config.bot.prefix}`)}**`)
            .setColor(`GREEN`)
            .setFooter(client.user.tag, client.user.displayAvatarURL({ dynamic: true }));
        ]
    })
}
