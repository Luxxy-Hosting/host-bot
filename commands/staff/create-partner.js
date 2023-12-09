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
        const data = ({
            "name": `[Partner] ${user.username}'s Server`,
            "user": userDB.consoleID,
            "nest": 1,
            "egg": 48,
            "docker_image": "ghcr.io/pterodactyl/yolks:java_18",
            "startup": "java -Xms128M -Xmx{{SERVER_MEMORY}}M -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}",
            "limits": {
                "memory": memory,
                "swap": 0,
                "disk": 32240,
                "io": 500,
                "cpu": 0
            },
            "environment": {
                "MINECRAFT_VERSION": "latest",
                "SERVER_JARFILE": "server.jar",
                "DL_PATH": "https://api.papermc.io/v2/projects/paper/versions/1.20.2/builds/318/downloads/paper-1.20.2-318.jar",
                "BUILD_NUMBER": "latest"
            },
            "feature_limits": {
                "databases": 2,
                "allocations": 1,
                "backups": 10
            },
            "deploy": {
                "locations": [ 2 ],
                "dedicated_ip": false,
                "port_range": []
            },
            "start_on_completion": false
        })

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
            data: data,
        }).then(res => {
            msg.edit(`${user.username}'s Partner Server has been created \n ${res.data.attributes.identifier} \n https://panel.luxxy.host/server/${res.data.attributes.identifier} `)

            // log
            const logchannel = client.channels.cache.get('971131533131915264')
            const embed = new Discord.EmbedBuilder()
            .setTitle(`${user.username}'s Partner Server has been created`)
            .setDescription(`${res.data.attributes.identifier} \n https://panel.luxxy.host/server/${res.data.attributes.identifier}`)
            .setColor(Discord.Colors.DarkAqua)
            .setTimestamp()
            logchannel.send({ embeds: [embed] })
        })
    })
}
