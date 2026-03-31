const { ContainerBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const config = require('../../config.json');
const axios = require('axios');
const userData = require('../../models/userData');
const { C, V2, errorMsg } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.support)) return message.channel.send('You do not have the required permissions to use this command.');
    const user = await message.mentions.users.first() || message.author;
    const userDB = await userData.findOne({ ID: user.id });
    const servercount = serverCount.get(user.id);

    if (!userDB) return message.reply({ components: [errorMsg('No Account', `${user.username} doesn't have an account yet.`)], ...V2 });
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
                .addTextDisplayComponents(td => td.setContent(`## 📋 ${user.username}'s Info`))
                .addSeparatorComponents(sep => sep.setDivider(true))
                .addTextDisplayComponents(td => td.setContent(
                    `**Console ID:** \`${userDB.consoleID}\`\n` +
                    `**Email:** \`${u.email}\`\n` +
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
                    `🎮 Gameservers: \`${serverCount.get(user.id).gameused}/${serverCount.get(user.id).gamehave}\`\n` +
                    `🤖 Bot Servers: \`${serverCount.get(user.id).botused}/${serverCount.get(user.id).bothave}\``
                ));

            message.reply({ components: [container], ...V2 });
        }).catch(err => {
            console.log(err);
        });
    }).catch(err => {
        console.log(err);
    });
};