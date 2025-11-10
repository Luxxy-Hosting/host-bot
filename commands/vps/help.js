const Discord = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
module.exports = async (client, message, args) => {
    const commands = fs.readdirSync('./commands/vps/');
    const commandNames = commands.map(file => file.split('.')[0]);
    message.reply({
        embeds: [
            new Discord.EmbedBuilder()
            .setDescription(`**__VPS Commands__**\n\n${commandNames.join(', \n')}`)
            .setColor(Discord.Colors.Green)
        ]
    })
}