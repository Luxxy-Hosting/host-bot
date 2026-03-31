const { ContainerBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const config = require('../../config.json');
const axios = require('axios');
const userData = require('../../models/userData');
const { C, V2, errorMsg } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.support)) return message.channel.send('You do not have the required permissions to use this command.');
    if (!args[1]) return message.reply({ components: [errorMsg('Missing Email', 'Please provide an email.')], ...V2 });

    const email1 = await args[1];
    const userDB = await userData.findOne({ email: email1 });
    if (!userDB) return message.reply({ components: [errorMsg('No Account', "That email doesn't have an account linked.")], ...V2 });

    const servercount = serverCount.get(userDB.ID);
    if (!servercount) return message.reply({ components: [errorMsg('No Data', "User doesn't have server count data.")], ...V2 });

    axios({
        url: config.pterodactyl.host + "/api/admin/users/" + userDB.consoleID + "/servers?per_page=100",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
    }).then(async response => {
        let servers = response.data?.servers?.data || [];
        let id = 1;
        axios({
            url: config.pterodactyl.host + "/api/admin/users/" + userDB.consoleID,
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        }).then(async res => {
            const u = res.data.user || res.data;
            const container = new ContainerBuilder()
                .setAccentColor(C.Blurple)
                .addTextDisplayComponents(td => td.setContent(`## 🔍 User Found`))
                .addSeparatorComponents(sep => sep.setDivider(true))
                .addTextDisplayComponents(td => td.setContent(
                    `**Console ID:** \`${userDB.consoleID}\`\n` +
                    `**Email:** \`${u.email}\`\n` +
                    `**Discord:** \`${userDB.ID}\` <@!${userDB.ID}>\n` +
                    `**Username:** \`${u.username}\`\n` +
                    `**Link Date:** \`${userDB.linkDate}\`\n` +
                    `**Link Time:** \`${userDB.linkTime}\``
                ))
                .addSeparatorComponents(sep => sep.setDivider(true))
                .addTextDisplayComponents(td => td.setContent(
                    `**Servers:**\n${servers.length === 0 ? 'None' : servers.map(x => `\`${id++}.\` **${x.name}** — \`${x.uuid_short}\``).join('\n')}`
                ))
                .addSeparatorComponents(sep => sep.setDivider(true))
                .addTextDisplayComponents(td => td.setContent(
                    `**Server Slots:**\n` +
                    `🎮 Gameservers: \`${servercount.mineused}/${servercount.minehave}\`\n` +
                    `🤖 Bot Servers: \`${servercount.botused}/${servercount.bothave}\``
                ));

            message.reply({ components: [container], ...V2 });
        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    });
};