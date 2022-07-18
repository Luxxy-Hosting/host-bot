const Discord = require("discord.js");
const axios = require("axios");
const config = require("../../config.json");
const userdata = require("../../models/userData");

module.exports = {
    name: "serverlist",
    category: "info",
    description: "lists the servers you got in your account",
    ownerOnly: false,
    run: async (client, interaction, args) => {
        const userDB = await userdata.findOne({ ID: interaction.user.id });
        if (!userDB) {
            interaction.reply({ content: 'You Don\'t have an account created. type `!user new` to create one' });
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
        }).then(async res => {
            responce = res.data.attributes.relationships.servers.data
            let id = 1
            let id2 = 1
            if(responce.length <= 35){
                interaction.reply({
                    embeds:[
                        new Discord.MessageEmbed()
                        .setTitle(`${message.author.username}'s servers`)
                        .addField('Server Id:', `\`\`\`\n${responce.map(x => `${id++}. ${x.attributes.identifier}`).join('\n')}\`\`\``, true)
                        .addField('Server Name:',`\`\`\`\n${responce.map(x => `${id2++}. ${x.attributes.name}`).join('\n')}\`\`\``, true)
                        .setColor(`GREEN`)
                    ]
                }).catch(err => {
                    interaction.reply({
                        embeds:[
                            new Discord.MessageEmbed()
                            .setTitle(`:x: | HOW MANY SERVERS DO U HAVE???`)
                            .setDescription(`${err}`)
                            .setColor(`RED`)
                        ]
                    })
                })
            } else {
                let id = 1
                let servers = responce.map(x => `${id++}. ${x.attributes.identifier} ➜ ${x.attributes.name}`).join('\n')
                interaction.reply({
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
}