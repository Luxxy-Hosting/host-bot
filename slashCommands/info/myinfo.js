const Discord = require("discord.js");
const axios = require("axios");
const config = require("../../config.json");
const userdata = require("../../models/userData");

module.exports = {
    name: "myinfo",
    category: "info",
    description: "Shows your Hosting Account Info",
    ownerOnly: false,
    run: async (client, interaction, args) => {
        const userDB = await userdata.findOne({ ID: interaction.user.id });

        if (!userDB) {
            interaction.reply({ content: 'You don\'t have an account created. type `!user new` to create one', ephemeral: true });
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
            const embed = new Discord.MessageEmbed()
                .setColor("#0099ff")
                .setTitle("Your Account Info")
                .setDescription(`Your Account Name: ${userDB.username}`)
                .addField("Email:", userDB.email)
                .addField("Console ID:", userDB.consoleID)
                .addField("link Time:", userDB.linkTime)
                .addField("link Date:", userDB.linkDate)
                .addField('Server Id:', `\`\`\`\n${responce.map(x => `${id++}. ${x.attributes.identifier}`).join('\n') || 'no Servers'}\`\`\``, true)
                .addField('Server Name:',`\`\`\`\n${responce.map(x => `${id2++}. ${x.attributes.name}`).join('\n')  || 'no Servers'}\`\`\``, true)
                .setTimestamp()
                .setFooter({ text: "Powered by Luxxy Hosting" });
            await interaction.reply({ embeds: [embed], ephemeral: true });
        }).catch(async err => {
           await interaction.reply({ content: `${err}`, ephemeral: true });
        })
    }
}
