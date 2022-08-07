const Discord = require('discord.js');
const fs = require('fs');
module.exports = async (client, message, args) => {
    const commands = fs.readdirSync('./commands/music/');
    const push = [];
    for (let i = 0; i < commands.length; i++) {
        let command = commands[i].split('.')[0];
        push.push(command);
    }
    const embed = new Discord.EmbedBuilder()
        .setColor(client.embedcolor)
        .setTitle('Music Help')
        .setDescription(`**${push.join(', ')}**`)
        .setFooter({ text: `Requested by ${message.author.tag}`, icon: message.author.avatarURL() });
    return message.channel.send({ embeds: [embed] });
}