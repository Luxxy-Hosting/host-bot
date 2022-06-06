const gencode = function () {
    const CAPSNUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var password = "";
        while (password.length < 16) {
            password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
        }
        return password;
}
const Discord = require('discord.js');
const config = require('../../config.json');
const moment = require('moment');

module.exports = async(client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.admin)) return message.channel.send('You do not have the required permissions to use this command.');

    if (!args[1]) {
        return message.reply(`Usage: \`${config.bot.prefix}gencode <name> <numberofservers>\``)
    }

    const code = gencode()
    const name = args[1]
    const number = args[2]
    const embed = new Discord.MessageEmbed()
    .addField(`Code`, `${code}`)
    .addField(`Name`, `${name}`)
    .addField(`Number of servers`, `${number}`)
    .setColor(`#0099ff`)
    .setTimestamp()
    message.reply({ embeds: [embed] }).then(msg => {
        codes.set(code, {
            code: code,
            createdBy: message.author.id,
            balance: number,
            createdAt: Date.now()
        });
        const logs = new Discord.MessageEmbed()
        .setTitle(`Code Created`)
        .addField(`Code`, `${code}`)
        .addField(`Name`, `${name}`)
        .addField(`Number of servers`, `${number}`)
        .addField(`Message Author`, `${message.author.tag}`)
        .setColor(`#0099ff`)
        .setTimestamp()
        client.channels.cache.get('971131533131915264').send({ embeds: [logs] })
    })

}