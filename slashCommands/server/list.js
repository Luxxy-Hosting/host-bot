const config = require('../../config.json')
const Discord = require('discord.js');
const axios = require('axios');
const userData = require('../../models/userData');

module.exports = {
    name: "list",
    category: "server",
    description: "List all your servers",
    options: [],
    ownerOnly: false,
    run: async (client, interaction) => {
        const userDB = await userData.findOne({ ID: interaction.user.id })
        if (!userDB) {
            return interaction.reply(`${global.error} You dont have an account created. Use \`/user new\` to create one`);
        }

        try {
            const response = await axios({
                url: config.pterodactyl.host + "/api/application/users/" + userDB.consoleID + "?include=servers",
                method: 'GET',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            });

            const serversList = response.data.attributes.relationships.servers.data
            let id = 1
            let id2 = 1

            if(serversList.length <= 35){
                await interaction.reply({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setTitle(`${interaction.user.username}'s servers`)
                        .addFields({ name: 'Server Id:', value: `\`\`\`\n${serversList.map(x => `${id++}. ${x.attributes.identifier}`).join('\n') || 'no Servers'}\`\`\``, inline: true})
                        .addFields({ name: 'Server Name:', value: `\`\`\`\n${serversList.map(x => `${id2++}. ${x.attributes.name}`).join('\n')  || 'no Servers'}\`\`\``, inline: true })
                        .setColor(Discord.Colors.Green)
                    ]
                });
            } else {
                let id = 1
                let servers = serversList.map(x => `${id++}. ${x.attributes.identifier} ➜ ${x.attributes.name}`).join('\n')
                await interaction.reply({
                    files:[
                        {
                            attachment: Buffer.from(servers),
                            name: "servers.txt"
                        }
                    ]
                });
            }
        } catch (err) {
            await interaction.reply({
                embeds:[
                    new Discord.EmbedBuilder()
                    .setTitle(`:x: | Error fetching servers`)
                    .setDescription(`${err.message}`)
                    .setColor(Discord.Colors.Red)
                ]
            });
        }
    }
}