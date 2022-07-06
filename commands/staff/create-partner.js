const { default: axios } = require('axios');
const Discord = require('discord.js');
const config = require('../../config.json');
const moment = require('moment');
const userData = require('../../models/userData');

module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.admin)) return message.channel.send('You do not have the required permissions to use this command.');
    const user = await message.mentions.users.first()

    if (!user) return message.reply({
        embeds: [
            new Discord.MessageEmbed()
            .setTitle(`:x: | You need to mention a user`)
            .setColor(`RED`)
        ]
    })
    const userDB = await userData.findOne({ ID: user.id });

    if (!userDB) {
        message.reply(`${user.username} is not in the database`)
        return;
    }

    const memory = args[2]
    
    if (!memory) {
        message.reply(`Please specify a memory size eg \`${config.bot.prefix}partner-create-partner <@user> 4096\``)
        return;
    }

    if (isNaN(memory)) {
        message.reply(`Memory size must be a number`)
    }

    if (memory < 4096) {
        message.reply(`Memory size must be at least 4096`)
    }

    if (memory > 16432) {
        message.reply(`Memory size must be less than 16432`)
    }

    message.reply(`${user.username} is now a partner`)
    message.reply(`Creating partner Server with ${memory} MB`).then(msg => {
        let ServerData
        let srvname = `${user.username}'s partner server`
        let location = [ 3 ]

        try {
            ServerData = require(`../../paid_creation/paper.js`)(userDB.consoleID, srvname, location, memory)
        } catch (err) {
            console.log(err)
        }

        axios({
            url: config.pterodactyl.host + "/api/application/servers",
            method: 'POST',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
            data: ServerData,
        }).then(res => {
            msg.edit(`${user.username}'s Partner Server has been created \n ${res.data.attributes.identifier} \n https://panel.luxxy.host/server/${res.data.attributes.identifier} `)

            // log
            const logchannel = client.channels.cache.get('971131533131915264')
            const embed = new Discord.MessageEmbed()
            .setTitle(`${user.username}'s Partner Server has been created`)
            .setDescription(`${res.data.attributes.identifier} \n https://panel.luxxy.host/server/${res.data.attributes.identifier}`)
            .setColor(`GREEN`)
            .setFooter(`${moment().format('dddd, MMMM Do YYYY, h:mm:ss a')}`)
            logchannel.send({ embeds: [embed] })
        })
    })
}