const { ContainerBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const config = require('../../config.json');
const moment = require('moment');
const { C, V2, infoMsg, successMsg } = require('../../helpers/components');

const gencode = function () {
    const CAPSNUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var password = "";
    while (password.length < 16) {
        password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
    }
    return password;
};

module.exports = async (client, message, args) => {
    return message.reply('This command is currently disabled.');
    if (!message.member.roles.cache.has(config.roleID.admin)) return message.channel.send('You do not have the required permissions to use this command.');

    if (!args[1]) {
        return message.reply({ components: [infoMsg('Usage', `\`${config.bot.prefix}gencode <name> <numberofservers>\``)], ...V2 });
    }

    const code = gencode();
    const name = args[1];
    const number = args[2];

    const container = new ContainerBuilder()
        .setAccentColor(C.Blurple)
        .addTextDisplayComponents(td => td.setContent(`## 🎟️ Code Generated`))
        .addSeparatorComponents(sep => sep.setDivider(true))
        .addTextDisplayComponents(td => td.setContent(
            `**Code:** \`${code}\`\n` +
            `**Name:** \`${name}\`\n` +
            `**Servers:** \`${number}\``
        ));

    message.reply({ components: [container], ...V2 }).then(msg => {
        codes.set(code, {
            code: code,
            createdBy: message.author.id,
            balance: number,
            createdAt: Date.now()
        });

        const logContainer = new ContainerBuilder()
            .setAccentColor(C.Aqua)
            .addTextDisplayComponents(td => td.setContent(`## 📋 Code Created`))
            .addSeparatorComponents(sep => sep.setDivider(true))
            .addTextDisplayComponents(td => td.setContent(
                `**Code:** \`${code}\`\n` +
                `**Name:** \`${name}\`\n` +
                `**Servers:** \`${number}\`\n` +
                `**Created By:** ${message.author.tag}`
            ));
        client.channels.cache.get('971131533131915264').send({ components: [logContainer], ...V2 });
    });
};