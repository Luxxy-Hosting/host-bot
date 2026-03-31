const { ContainerBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');
const userData = require('../../models/userData');
const { C, V2, errorMsg, successMsg, loadingMsg } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id });
    if (!userDB) return message.reply({ components: [errorMsg('No Account', `You don't have an account. Type \`${config.bot.prefix}user new\` to create one.`)], ...V2 });

    const CAPSNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var getPassword = () => {
        var password = "";
        while (password.length < 10) {
            password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
        }
        return password;
    };

    let password = await getPassword();

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
    if (!owner_uuid) return message.reply({ components: [errorMsg('Not Found', 'Could not find your connected account on the panel!')], ...V2 });

    axios({
        url: config.pterodactyl.host + "/api/admin/users/" + owner_uuid,
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Accept': 'application/json',
        },
    }).then(fetch => {
        const u = fetch.data.user || fetch.data;
        const data = {
            "email": u.email,
            "username": u.username,
            "name_first": u.name_first || u.first_name,
            "name_last": u.name_last || u.last_name,
            "password": password
        };
        axios({
            url: config.pterodactyl.host + "/api/admin/users/" + owner_uuid,
            method: 'PATCH',
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            data: data,
        }).then(user => {
            const dmContainer = new ContainerBuilder()
                .setAccentColor(C.Blurple)
                .addTextDisplayComponents(td => td.setContent(`## 🔑 Password Reset`))
                .addSeparatorComponents(sep => sep.setDivider(true))
                .addTextDisplayComponents(td => td.setContent(`New password for Luxxy Hosting: ||**${data.password}**||`))
                .addTextDisplayComponents(td => td.setContent(`-# This message will auto‑destruct in 10 minutes`));

            client.users.cache.get(message.author.id).send({ components: [dmContainer], ...V2 }).then(x => {
                message.channel.send({ components: [successMsg('Password Changed', 'Check your DMs for your new password!')], ...V2 }).catch(err => {
                    message.channel.send(`${err}`);
                });
                setInterval(() => {
                    x.delete().catch(err => {});
                }, 600000);
            }).catch(err => {
                message.channel.send(`${err}`);
            });
        }).catch(err => {
            message.channel.send(`${err}`);
        });
    }).catch(err => {
        message.channel.send(`${err}`);
    });
};
