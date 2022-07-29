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


    axios({
        url: config.pterodactyl.host + "/api/application/users/" + userDB.consoleID + "?include=servers",
        method: 'GET',
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'Application/vnd.pterodactyl.v1+json',
        }
    }).then(async response => {
        responce = response.data.attributes.relationships.servers.data
        let id = 1
        let id2 = 1

        if(responce.length <= 35){
            message.reply({
                embeds:[
                    new Discord.EmbedBuilder()
                    .setTitle(`${message.author.username}'s servers`)
                    .addFields({ name: 'Server Id:', value: `\`\`\`\n${responce.map(x => `${id++}. ${x.attributes.identifier}`).join('\n') || 'no Servers'}\`\`\``, inline: true})
                    .addFields({ name: 'Server Name:', value: `\`\`\`\n${responce.map(x => `${id2++}. ${x.attributes.name}`).join('\n')  || 'no Servers'}\`\`\``, inline: true })
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
            let servers = responce.map(x => `${id++}. ${x.attributes.identifier} ➜ ${x.attributes.name}`).join('\n')
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