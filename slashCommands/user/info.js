const Discord = require('discord.js');
const userData = require('../../models/userData');
const config = require('../../config.json')

module.exports = {
    name: "info",
    category: "user",
    description: "Show your account information",
    options: [],
    ownerOnly: false,
    run: async (client, interaction) => {
        const userDataDB = await userData.findOne({ ID: interaction.user.id });
        if(!userDataDB) return interaction.reply(`:x: You dont have an account created. Use \`/user new\` to create one`)
        
        await interaction.reply({
            embeds:[
                new Discord.EmbedBuilder()
                .setColor(0x00ff00)
                .addFields({ name: `Username:`, value: `${userDataDB.username}`, inline: true })
                .addFields({ name: `Link Date:`, value: `${userDataDB.linkDate}`, inline: true })
                .addFields({ name: `Link Time:`, value: `${userDataDB.linkTime}`, inline: true })
                .setTimestamp()
            ]
        })
    }
}