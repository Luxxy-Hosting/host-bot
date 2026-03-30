const Discord = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');
const userData = require('../../models/userData');
module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id });
    if(!userDB) return message.reply(`:x: You dont have an account created. type \`${config.bot.prefix}user new\` to create one`)

    const CAPSNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    var getPassword = () => {

        var password = "";
        while (password.length < 10) {
            password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
        }
        return password;
    };

    let password = await getPassword();
    
    // 1. Fetch Owner UUID
    let owner_uuid = null;
    if (userDB.consoleID && userDB.consoleID.length > 20) {
        owner_uuid = userDB.consoleID;
    } else if (userDB.email) {
        try {
            const uResE = await axios.get(config.pterodactyl.host + "/api/admin/users", {
                headers: { 'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey, 'Accept': 'application/json' },
                params: { 'filter[email]': userDB.email }
            });
            if (uResE.data.users?.data?.length > 0) owner_uuid = uResE.data.users.data[0].uuid;
        } catch(e) {}
    }
    if (!owner_uuid) return message.reply(":x: Could not find your connected account on the panel!");

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
        }
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
            client.users.cache.get(message.author.id).send({embeds:[
                new Discord.EmbedBuilder()
                .setColor(Discord.Colors.Blue)
                .addFields({ name: 'Reset Password', value: `New password for Luxxy Hosting: ||**${data.password}**||` })
                .setFooter({text:`This message will autodestruct in 10 minutes`})
            ]}).then(x => {
                message.channel.send({embeds:[
                    new Discord.EmbedBuilder()
                    .setTitle(`✅ | Password Changed Succesufuly`)
                    .setColor(Discord.Colors.Green)
                    .addFields({ name: 'Done', value: 'Check your [dms](https://discord.com/channels/@me/${x.channelId}) for your new password!'})
                ]}).catch(err => {
                    message.channel.send(`${err}`)
                })
                setInterval(() => {
                    x.delete().catch(err => {})
                },600000)
            }).catch(err => {
                message.channel.send(`${err}`)
            })
        }).catch(err => {
            message.channel.send(`${err}`)
        })
    }).catch(err => {
        message.channel.send(`${err}`)
    })
}
