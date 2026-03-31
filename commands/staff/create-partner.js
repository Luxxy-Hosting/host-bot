const { ContainerBuilder, MessageFlags } = require('discord.js');
const { default: axios } = require('axios');
const config = require('../../config.json');
const userData = require('../../models/userData');
const { C, V2, errorMsg, successMsg, infoMsg } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.admin)) return message.channel.send('You do not have the required permissions to use this command.');
    const user = await message.mentions.users.first();

    if (!user) return message.reply({ components: [errorMsg('Missing User', 'You need to mention a user.')], ...V2 });
    
    const userDB = await userData.findOne({ ID: user.id });

    if (!userDB) {
        return message.reply({ components: [errorMsg('Not found', `${user.username} is not in the database.`)], ...V2 });
    }

    const memory = args[2];
    
    if (!memory) {
        return message.reply({ components: [infoMsg('Usage', `Please specify a memory size e.g. \`${config.bot.prefix}create-partner <@user> 4096\``)], ...V2 });
    }

    if (isNaN(memory)) return message.reply({ components: [errorMsg('Invalid', 'Memory size must be a number.')], ...V2 });
    if (memory < 4096) return message.reply({ components: [errorMsg('Invalid', 'Memory size must be at least 4096.')], ...V2 });
    if (memory > 16432) return message.reply({ components: [errorMsg('Invalid', 'Memory size must be less than 16432.')], ...V2 });

    const initContainer = infoMsg('Partner Creation', `Creating partner server for **${user.username}** with ${memory} MB...`);
    message.reply({ components: [initContainer], ...V2 }).then(msg => {
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
        });

        axios({
            url: config.pterodactyl.host + "/api/admin/servers",
            method: 'POST',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            data: data,
        }).then(res => {
            const srv = res.data.server || res.data;
            const shortId = srv.uuid_short || srv.uuid?.split('-')[0];
            
            const successC = new ContainerBuilder()
                .setAccentColor(C.Success)
                .addTextDisplayComponents(td => td.setContent(`## ✅ Partner Server Created`))
                .addSeparatorComponents(sep => sep.setDivider(true))
                .addTextDisplayComponents(td => td.setContent(
                    `**User:** <@${user.id}>\n` +
                    `**Server ID:** \`${shortId}\`\n` +
                    `**Memory:** \`${memory} MB\`\n` +
                    `**Link:** ${config.pterodactyl.host}/server/${shortId}`
                ));

            msg.edit({ components: [successC], ...V2 });

            // log
            const logchannel = client.channels.cache.get('971131533131915264');
            if (logchannel) {
                const logC = new ContainerBuilder()
                    .setAccentColor(C.DarkGrey)
                    .addTextDisplayComponents(td => td.setContent(`## 📋 Partner Server Created`))
                    .addSeparatorComponents(sep => sep.setDivider(true))
                    .addTextDisplayComponents(td => td.setContent(
                        `**User:** <@${user.id}>\n` +
                        `**Server ID:** \`${shortId}\`\n` +
                        `**Memory:** \`${memory} MB\`\n` +
                        `**Link:** ${config.pterodactyl.host}/server/${shortId}`
                    ));
                logchannel.send({ components: [logC], ...V2 });
            }
        });
    });
};
