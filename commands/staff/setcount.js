const Discord = require('discord.js');
const config = require('../../config.json');

module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.admin)) return message.channel.send ('You do not have the required permissions to use this command.');
    const user = await message.mentions.users.first();

    if (!user) return message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setTitle(`:x: | You need to mention a user`)
            .setColor(`RED`)
        ]
    })
    if (!userData.get(user.id)) return message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setTitle(`:x: | ${user.username} doesn't have an account yet`)
            .setColor(`RED`)
        ]
    })
    if (!serverCount.get(user.id)) return message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setTitle(`:x: | ${user.username} doesn't have a count yet`)
            .setColor(`RED`)
        ]
    })
    const used1 = serverCount.get(user.id).used;
    const number = args [2];

    if (!number) return message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setTitle(`:x: | You need to specify a number`)
            .setColor(`RED`)
        ]
    })

    serverCount.set(user.id, {
        used: used1,
        have: number
    })
    message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setTitle(`:white_check_mark: | ${user.username}'s count has been set to ${number}`)
            .setColor(`GREEN`)
            .setDescription(`${user.username}'s count has been set to ${serverCount.get(user.id).used} / ${number}`)
        ]
    })
}