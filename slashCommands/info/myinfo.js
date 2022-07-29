const Discord = require("discord.js");
const axios = require("axios");
const config = require("../../config.json");
const userdata = require("../../models/userData");

module.exports = {
    name: "myinfo",
    category: "info",
    description: "Shows your Hosting Account Info",
    type: Discord.ApplicationCommandType.ChatInput,
    ownerOnly: false,
    run: async (client, interaction, args) => {
        const userDB = await userdata.findOne({ ID: interaction.user.id });

        if (!userDB) {
            interaction.reply({ content: 'You Don\'t have an account created. type `!user new` to create one', ephemeral: true });
            return;
        }

        axios({
            url: config.pterodactyl.host + "/api/application/users/" + userDB.consoleID + "?include=servers",
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).then(async res => {
            responce = res.data.attributes.relationships.servers.data
            let id = 1
            let id2 = 1
            const embed = new Discord.EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle("Your Account Info")
                .setDescription(`Your Account Name: ${userDB.username}`)
                .addFields({ name: 'Email:', value: `${userDB.email}`})
                .addFields({ name: 'Console ID:', value: `${userDB.consoleID}`})
                .addFields({ name: 'Link Time:', value: `${userDB.linkTime}`})
                .addFields({ name: 'Link Date:', value: `${userDB.linkDate}`})
                .addFields({ name: 'Server Id:', value: `\`\`\`\n${responce.map(x => `${id++}. ${x.attributes.identifier}`).join('\n') || 'no Servers'}\`\`\``, inline: true})
                .addFields({ name: 'Server Name:', value: `\`\`\`\n${responce.map(x => `${id2++}. ${x.attributes.name}`).join('\n')  || 'no Servers'}\`\`\``, inline: true })
                .setTimestamp()
                .setFooter({ text: 'Hello', iconURL: 'https://i.imgur.com/wSTFkRM.png' });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }).catch(async err => {
           await interaction.reply({ content: `${err}`, ephemeral: true });
        })
    }
}