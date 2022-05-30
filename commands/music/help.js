const Discord = require('discord.js');
const fs = require('fs');
const config = require('../../config.json')
module.exports = async (client, message, args) => {
    const commands = fs.readdirSync('./commands/music/');
    const push = [];
    for (let i = 0; i < commands.length; i++) {
        let command = commands[i].split('.')[0];
        push.push(command);
    }
    const embed = new Discord.MessageEmbed()
        .setColor(client.embedcolor)
        .setTitle('Music Help')
        .setDescription(`**${config.bot.prefix}${push.join(`, ${config.bot.prefix}`)}**`)
        .setFooter(client.user.tag, client.user.displayAvatarURL({ dynamic: true }));
    return message.channel.send({ embeds: [embed] });
}
