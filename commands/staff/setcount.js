const { MessageFlags } = require('discord.js');
const config = require('../../config.json');
const userData = require('../../models/userData');
const { C, V2, errorMsg, successMsg } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.admin)) return message.channel.send('You do not have the required permissions to use this command.');
    const user = await message.mentions.users.first();

    if (!user) return message.reply({ components: [errorMsg('Missing User', 'You need to mention a user.')], ...V2 });

    const userDB = await userData.findOne({ ID: user.id });
    if (!userDB) return message.reply({ components: [errorMsg('No Account', `${user.username} doesn't have an account yet.`)], ...V2 });
    if (!serverCount.get(user.id)) return message.reply({ components: [errorMsg('No Count', `${user.username} doesn't have a count yet.`)], ...V2 });

    const used1 = serverCount.get(user.id).used;
    const number = args[2];

    if (!number) return message.reply({ components: [errorMsg('Missing Number', 'You need to specify a number.')], ...V2 });

    serverCount.set(user.id, {
        used: used1,
        have: number
    });

    message.reply({
        components: [successMsg(`Count Updated`, `**${user.username}**'s count has been set to \`${serverCount.get(user.id).used}/${number}\``)],
        ...V2
    });
};
