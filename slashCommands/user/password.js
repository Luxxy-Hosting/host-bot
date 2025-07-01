const Discord = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');
const userData = require('../../models/userData');

module.exports = {
    name: "password",
    category: "user",
    description: "Reset your panel password",
    options: [],
    ownerOnly: false,
    run: async (client, interaction) => {
        const userDB = await userData.findOne({ ID: interaction.user.id });
        if(!userDB) return interaction.reply(`:x: You dont have an account created. Use \`/user new\` to create one`)

        const CAPSNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var getPassword = () => {
            var password = "";
            while (password.length < 10) {
                password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
            }
            return password;
        };

        let password = await getPassword();
        
        try {
            const fetchResponse = await axios({
                url: config.pterodactyl.host + "/api/application/users/" + userDB.consoleID,
                method: 'GET',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                },
            });

            const data = {
                "email": fetchResponse.data.attributes.email,
                "username": fetchResponse.data.attributes.username,
                "first_name": fetchResponse.data.attributes.first_name,
                "last_name": fetchResponse.data.attributes.last_name,
                "password": password
            }

            await axios({
                url: config.pterodactyl.host + "/api/application/users/" + userDB.consoleID,
                method: 'PATCH',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                },
                data: data,
            });

            try {
                const dmMessage = await client.users.cache.get(interaction.user.id).send({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setColor(Discord.Colors.Blue)
                        .addFields({ name: 'Reset Password', value: `New password for Luxxy Hosting: ||**${data.password}**||` })
                        .setFooter({text:`This message will autodestruct in 10 minutes`})
                    ]
                });

                await interaction.reply({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setTitle(`✅ | Password Changed Successfully`)
                        .setColor(Discord.Colors.Green)
                        .addFields({ name: 'Done', value: `Check your [dms](https://discord.com/channels/@me/${dmMessage.channelId}) for your new password!`})
                    ]
                });

                setTimeout(() => {
                    dmMessage.delete().catch(err => {})
                }, 600000);

            } catch (dmErr) {
                await interaction.reply({
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setTitle(`✅ | Password Changed Successfully`)
                        .setColor(Discord.Colors.Green)
                        .addFields({ name: 'Password', value: `||**${data.password}**||` })
                        .addFields({ name: 'Note', value: 'Could not send DM. Here is your new password (delete this message after saving!)' })
                    ],
                    ephemeral: true
                });
            }

        } catch (err) {
            await interaction.reply(`❌ Error: ${err.message}`)
        }
    }
}