const Discord = require('discord.js');
const userData = require('../../models/userData');
const config = require('../../config.json')
module.exports = async (client, message, args) => {
    //const userDB = userData.get(message.author.id)
    const userDataDB = await userData.findOne({ ID: message.author.id });
    if(!userDataDB) return message.reply(`:x: You dont have an account created. type \`${config.bot.prefix}user new\` to create one`)
    
    message.channel.send({embeds:[
        new Discord.MessageEmbed()
        .setColor(`GREEN`)
        .addField(`Username:`, `${userDataDB.username}`)
        .addField(`Link Date:`, `${userDataDB.linkDate}`)
        .addField(`Link Time:`, `${userDataDB.linkTime}`)
    ]})
}
