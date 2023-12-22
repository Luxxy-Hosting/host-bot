const Discord = require('discord.js');
const config = require('../../config.json');
const {
  EmbedBuilder,
  Permissions,
} = require(`discord.js`);

module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.admin)) return message.channel.send('You do not have the required permissions to use this command.');
    const user = message.mentions.members.filter(member=>member.guild.id==message.guild.id).first() || message.guild.members.cache.get(args[0] ? args[0] : ``) || await message.guild.members.fetch(args[0] ? args[0] : ``).catch(() => {}) || false;
    if (!user) return message.reply({
        embeds: [
            new Discord.EmbedBuilder()
            .setTitle(`:x: | You need to mention a user`)
            .setColor(Discord.Colors.Red)
        ]
    })
    if (!message.guild.members.cache.get(user.id)) return message.reply({
        embeds: [
            new Discord.EmbedBuilder()
            .setTitle(`:x: | ${user.user.tag} is not in this server`)
            .setColor(Discord.Colors.Red)
        ]
    })
    const memberPosition = user.roles.highest.position;
    const moderationPosition = message.member.roles.highest.position;
    if (moderationPosition <= memberPosition)
        return message.reply({embeds : [new EmbedBuilder()
                                        .setColor(Discord.Colors.Red)
                                        .setTitle(`:x: | I cannot ban someone, who is above/equal you`)
                                       ]});
    let reason = args.slice(2).join(` `);
    if (!reason) {
        reason = `NO REASON`;
    }
    
    message.guild.members.cache.get(user.id).ban({ reason: reason }).then(e => {
        message.channel.send({
            embeds: [
                new Discord.EmbedBuilder()
                .setTitle(`:white_check_mark: | ${user.user.tag} has been banned for: ` + reason)
                .setColor(Discord.Colors.Green)
            ]
        })
    }).catch(err => {
        message.channel.send({
            embeds: [
                new Discord.EmbedBuilder()
                .setTitle(`:x: | ${user.user.tag} could not be banned`)
                .setDescription(`${err}`)
                .setColor(Discord.Colors.Green)
            ]
        })
    })
}
