
const Discord = require('discord.js');
const userData = require('../../models/userData');
const config = require('../../config.json')
module.exports = async (client, message, args) => {
    const userDataDB = await userData.findOne({ ID: message.author.id });
    if(!userDataDB) return message.reply(`:x: You dont have an account created. type \`${config.bot.prefix}user new\` to create one`)
    
    message.channel.send({embeds:[
        new Discord.EmbedBuilder()
        .setColor(0x00ff00)
        .addFields({ name: `Username:`, value: `${userDataDB.username}`, inline: true })
        .addFields({ name: `Link Date:`, value: `${userDataDB.linkDate}`, inline: true })
        .addFields({ name: `Link Date:`, value: `${userDataDB.linkTime}`, inline: true })
        .setTimestamp()
    ]})
}