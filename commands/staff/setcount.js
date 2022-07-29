const Discord = require('discord.js');
const config = require('../../config.json');
const userData = require('../../models/userData');

module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.admin)) return message.channel.send ('You do not have the required permissions to use this command.');
    const user = await message.mentions.users.first();

    if (!user) return message.reply({
        embeds: [
            new Discord.EmbedBuilder()
            .setTitle(`:x: | You need to mention a user`)
            .setColor(Discord.Colors.Red)
        ]
    })
    const userDB = await userData.findOne({ ID: user.id });
    if (!userDB) return message.reply({
        embeds: [
            new Discord.EmbedBuilder()
            .setTitle(`:x: | ${user.username} doesn't have an account yet`)
            .setColor(Discord.Colors.Red)
        ]
    })
    if (!serverCount.get(user.id)) return message.reply({
        embeds: [
            new Discord.EmbedBuilder()
            .setTitle(`:x: | ${user.username} doesn't have a count yet`)
            .setColor(Discord.Colors.Red)
        ]
    })
    const used1 = serverCount.get(user.id).used;
    const number = args [2];

    if (!number) return message.reply({
        embeds: [
            new Discord.EmbedBuilder()
            .setTitle(`:x: | You need to specify a number`)
            .setColor(Discord.Colors.Red)
        ]
    })

    serverCount.set(user.id, {
        used: used1,
        have: number
    })
    message.reply({
        embeds: [
            new Discord.EmbedBuilder()
            .setAuthor(`${user.username}'s count has been set.` , user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }))
            .setColor(Discord.Colors.Green)
            .setDescription(`${user.username}'s count has been set to ${serverCount.get(user.id).used} / ${number}`)
        ]
    })
}
