const { default: axios } = require('axios');
const { ContainerBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const moment = require('moment');
const config = require('../../config.json');
const userData = require('../../models/userData');
const { C, V2, errorMsg, successMsg } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.administrator))
        return message.reply({ components: [errorMsg('No Permission', 'You do not have the required permissions to use this command!')], ...V2 });

    if (!args[1]) return message.reply({ components: [errorMsg('Usage', `\`${config.bot.prefix}staff link @user <consoleid>\``)], ...V2 });

    const user1 = message.mentions.users.first();
    if (!user1) return message.reply({ components: [errorMsg('Missing User', 'You need to specify a user to link!')], ...V2 });

    const consoleid = args[2];
    if (!consoleid) return message.reply({ components: [errorMsg('Missing ID', 'You need to specify a console ID!')], ...V2 });

    if (args[2] == 1 && message.author.id !== '517107022399799331') {
        return message.reply({ components: [errorMsg('Denied', 'You cannot link this user to this consoleID!')], ...V2 });
    }

    axios({
        url: config.pterodactyl.host + "/api/admin/users/" + consoleid,
        method: 'get',
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    }).then(async user => {
        const u = user.data.user || user.data;
        userData({
            ID: user1.id,
            consoleID: consoleid,
            email: u.email,
            username: u.username,
            linkTime: moment().format("HH:mm:ss"),
            linkDate: moment().format("YYYY-MM-DD"),
        }).save();

        const container = new ContainerBuilder()
            .setAccentColor(C.Success)
            .addTextDisplayComponents(td => td.setContent(`## ✅ User Linked`))
            .addSeparatorComponents(sep => sep.setDivider(true))
            .addTextDisplayComponents(td => td.setContent(
                `**Username:** \`${u.username}\`\n` +
                `**Email:** \`${u.email}\`\n` +
                `**Console ID:** \`${consoleid}\``
            ));

        message.reply({ components: [container], ...V2 });
    });
};