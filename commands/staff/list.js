const { ContainerBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const config = require('../../config.json');
const axios = require('axios');
const userData = require('../../models/userData');
const { C, V2, errorMsg } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.support)) return message.channel.send('You do not have the required permissions to use this command.');
    const user = await message.mentions.users.first();
    if (!user) return message.reply({ components: [errorMsg('Missing User', 'You need to mention a user.')], ...V2 });

    const userDB = await userData.findOne({ ID: user.id });
    if (!userDB) return message.reply({ components: [errorMsg('No Account', `${user.username} doesn't have an account yet.`)], ...V2 });

    axios({
        url: config.pterodactyl.host + "/api/admin/users/" + userDB.consoleID + "/servers?per_page=100",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }).then(async response => {
        let servers = response.data?.servers?.data || [];
        let id = 1;

        if (servers.length <= 35) {
            const container = new ContainerBuilder()
                .setAccentColor(C.Success)
                .addTextDisplayComponents(td => td.setContent(`## 📋 ${user.username}'s Servers`))
                .addSeparatorComponents(sep => sep.setDivider(true))
                .addTextDisplayComponents(td => td.setContent(
                    servers.length === 0
                        ? 'No servers found.'
                        : servers.map(x => `\`${id++}.\` **${x.name}** — \`${x.uuid_short}\``).join('\n')
                ));

            message.reply({ components: [container], ...V2 });
        }
    });
};