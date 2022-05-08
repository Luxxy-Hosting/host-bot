const Discord = require('discord.js')

module.exports = {
    name: 'uptime',
    aliases: [''],

    async run(client, message, args) {
        const uptime = {
            days: Math.floor(client.uptime / 86400000),
            hours: Math.floor(client.uptime / 3600000),
            minutes: Math.floor(client.uptime / 60000),
            seconds: Math.floor(client.uptime / 1000)
        }
        const embed = new Discord.MessageEmbed()
            .setColor('BLUE')
            .setDescription(`✅ **${client.user.tag}** is online for ${uptime.days} days, ${uptime.hours} hours, ${uptime.minutes} minutes and ${uptime.seconds} seconds.`)
        message.reply({ embeds: [embed] });
    }
}