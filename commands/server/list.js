const config = require('../../config.json')
const Discord = require('discord.js');
const axios = require('axios');
const userData = require('../../models/userData');
module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id })
    if (!userDB) {
        message.reply(`${error} You dont have an account created. type \`${config.bot.prefix}user new\` to create one`);
        return;
    }

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
        url: config.pterodactyl.host + "/api/admin/users/" + owner_uuid + "/servers?per_page=100",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }).then(async response => {
        let responce = response.data.servers?.data || [];
        let id = 1
        let id2 = 1

        if(responce.length <= 35){
            message.reply({
                embeds:[
                    new Discord.EmbedBuilder()
                    .setTitle(`${message.author.username}'s servers`)
                    .addFields({ name: 'Server Id:', value: `\`\`\`\n${responce.map(x => `${id++}. ${x.uuid_short}`).join('\n') || 'no Servers'}\`\`\``, inline: true})
                    .addFields({ name: 'Server Name:', value: `\`\`\`\n${responce.map(x => `${id2++}. ${x.name}`).join('\n')  || 'no Servers'}\`\`\``, inline: true })
                    .setColor(Discord.Colors.Green)
                ]
            }).catch(err => {
                message.reply({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setTitle(`:x: | HOW MANY SERVERS DO U HAVE???`)
                        .setDescription(`${err}`)
                        .setColor(Discord.Colors.Red)
                    ]
                })
            })
        }else{
            let id = 1
            let servers = responce.map(x => `${id++}. ${x.uuid_short} ➜ ${x.name}`).join('\n')
            message.channel.send({
                files:[
                    {
                        attachment: Buffer.from(servers),
                        name: "servers.js"
                    }
                ]
            })
        }
    })
}