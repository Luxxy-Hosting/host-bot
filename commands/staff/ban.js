const Discord = require('discord.js');
const config = require('../../config.json');

module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.admin)) return message.channel.send('You do not have the required permissions to use this command.');
    const user = await message.mentions.users.first()
    if (!user) return message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setTitle(`:x: | You need to mention a user`)
            .setColor(`RED`)
        ]
    })
    if (!message.guild.members.cache.get(user.id)) return message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setTitle(`:x: | ${user.username} is not in this server`)
            .setColor(`RED`)
        ]
    })
    message.guild.members.cache.get(user.id).ban({ reason: `${message.author.tag} run command` }).then(e => {
        message.channel.send({
            embeds: [
                new Discord.MessageEmbed()
                .setTitle(`:white_check_mark: | ${user.username} has been banned`)
                .setColor(`GREEN`)
            ]
        })
    }).catch(err => {
        message.channel.send({
            embeds: [
                new Discord.MessageEmbed()
                .setTitle(`:x: | ${user.username} could not be banned`)
                .setDescription(`${err}`)
                .setColor(`RED`)
            ]
        })
    })
}