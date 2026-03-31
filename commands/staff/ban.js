const { ContainerBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const config = require('../../config.json');
const { C, V2, errorMsg, successMsg } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.admin)) return message.channel.send('You do not have the required permissions to use this command.');

    const user = message.mentions.members.filter(member => member.guild.id == message.guild.id).first() || message.guild.members.cache.get(args[0] ? args[0] : ``) || await message.guild.members.fetch(args[0] ? args[0] : ``).catch(() => {}) || false;
    if (!user) return message.reply({ components: [errorMsg('Missing User', 'You need to mention a user.')], ...V2 });
    if (!message.guild.members.cache.get(user.id)) return message.reply({ components: [errorMsg('Not Found', `${user.user.tag} is not in this server.`)], ...V2 });

    const memberPosition = user.roles.highest.position;
    const moderationPosition = message.member.roles.highest.position;
    if (moderationPosition <= memberPosition)
        return message.reply({ components: [errorMsg('Cannot Ban', 'Cannot ban someone who is above or equal to you.')], ...V2 });

    let reason = args.slice(2).join(` `);
    if (!reason) reason = `No reason provided`;

    message.guild.members.cache.get(user.id).ban({ reason: reason }).then(e => {
        message.channel.send({ components: [successMsg('User Banned', `**${user.user.tag}** has been banned.\n**Reason:** ${reason}`)], ...V2 });
    }).catch(err => {
        message.channel.send({ components: [errorMsg('Ban Failed', `Could not ban **${user.user.tag}**\n\`${err}\``)], ...V2 });
    });
};
