const config = require('../../config.json');
const { ContainerBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const userData = require('../../models/userData');
const { C, V2, errorMsg } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id });
    if (!userDB) {
        return message.reply({ components: [errorMsg('No Account', `You don't have an account. Type \`${config.bot.prefix}user new\` to create one.`)], ...V2 });
    }

    let owner_uuid = null;
    if (userDB.consoleID && userDB.consoleID.length > 20) {
        owner_uuid = userDB.consoleID;
    } else if (userDB.email) {
        try {
            const uResE = await axios.get(config.pterodactyl.host + "/api/admin/users", {
                headers: { 'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey, 'Accept': 'application/json' },
                params: { search: userDB.email, per_page: 50 }
            });
            const match = (uResE.data.users?.data || []).find(u => u.email?.toLowerCase() === userDB.email.toLowerCase());
            if (match) owner_uuid = match.uuid;
        } catch(e) {}
    }
    if (!owner_uuid) return message.reply({ components: [errorMsg('Not Found', 'Could not find your account on the panel!')], ...V2 });

    axios({
        url: config.pterodactyl.host + "/api/admin/users/" + owner_uuid + "/servers?per_page=100",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }).then(async response => {
        let servers = response.data.servers?.data || [];

        if (servers.length <= 35) {
            let id = 1;
            const container = new ContainerBuilder()
                .setAccentColor(C.Success)
                .addTextDisplayComponents(td => td.setContent(`## 📋 ${message.author.username}'s Servers`))
                .addSeparatorComponents(sep => sep.setDivider(true))
                .addTextDisplayComponents(td => td.setContent(
                    servers.length === 0
                        ? 'No servers found.'
                        : servers.map(x => `\`${id++}.\` **${x.name}** — \`${x.uuid_short}\``).join('\n')
                ));

            message.reply({ components: [container], ...V2 });
        } else {
            let id = 1;
            let serverText = servers.map(x => `${id++}. ${x.uuid_short} ➜ ${x.name}`).join('\n');
            message.channel.send({
                files: [{
                    attachment: Buffer.from(serverText),
                    name: "servers.txt"
                }]
            });
        }
    });
};