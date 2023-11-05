const Discord = require('discord.js');
const config = require('../../config.json');
const fs = require('fs');
module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.support)) return message.channel.send('You do not have the required permissions to use this command.');

    const user = client.users.cache.get('836963172513480723')

    const sirmes = args[1]

    user.send(sirmes).then(eg => { message.reply('i have dm intol') }).catch(e => { console.log(e) })
}