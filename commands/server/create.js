const config = require('../../config.json')
const Discord = require('discord.js');
const axios = require('axios');
const userData = require('../../models/userData');
const serverData = require('../../models/serverData');
const emoji = '<:blue_arrow:964977636084416535>'

module.exports = async (client, message, args) => {
    const user = message.author;
    if (!serverCount.get(user.id)) {
        await serverCount.set(user.id, {
            gameused: 0,
            botused: 0,
            gamehave: 1,
            bothave: 2
        });
    }

    const userDB = await userData.findOne({ ID: message.author.id });
    if (!userDB) {
        message.reply(`${error} You dont have an account created. type \`${config.bot.prefix}user new\` to create one`);
        return;
    }

    if (!args[1] || args[1]?.toLowerCase() === 'list') {
        const panelButton = new Discord.ButtonBuilder().setStyle('Link').setURL('https://panel.luxxy.cloud').setLabel("Panel");
        const row = new Discord.ActionRowBuilder().addComponents([panelButton]);

        const noTypeListed = new Discord.EmbedBuilder()
            .setColor(0x36393f)
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ format: 'png', size: 1024, dynamic: true }) })
            .setTitle('Types of servers you can create:')
            .addFields(
                { name: `${emoji} __**Discord Bots**__: `, value: `> NodeJS \n > Python \n > AIO (all in one) \n > Bun`, inline: true },
                { name: `${emoji} __**Databases**__:`, value: `> MongoDB \n > Redis`, inline: true },
                { name: `${emoji} __**Web**__:`, value: `> Nginx \n > Uptime-Kuma`, inline: true },
                { name: `${emoji} __**Other**__:`, value: `> BeamMP \n > Teamspeak \n > Codeserver`, inline: true },
                { name: `${emoji} __**Minecraft**__:`, value: `> Paper \n > Purpur \n > Bedrock \n > PocketmineMP \n > Fabric \n > Vanillamc`, inline: true }
            )
            .setFooter({ text: `Example: ${config.bot.prefix}server create paper Luxxy is the best`, iconURL: message.guild.iconURL({ size: 1024, format: 'png', dynamic: true }) });

        message.channel.send({
            content: `> ${error} What type of server you want me to create?`,
            embeds: [noTypeListed],
            components: [row]
        });
        return;
    }

    let srvname = args.slice(2).join(' ');
    let ServerData, serverType;

    try {
        const creationModule = require(`../../server_creation/${args[1]?.toLowerCase()}.js`);
        const result = creationModule(userDB.consoleID, srvname ? srvname : args[1], config.pterodactyl.depolymentlocations);
        ServerData = result.data;
        serverType = result.serverType;
    } catch (err) {
        console.log(err);
        message.reply(`${error} I could not find any server type with the name: \`${args[1]}\`\nType \`!server create list\` for more info`);
        return;
    }

    const usage = serverCount.get(user.id);
    if (serverType === 'gameserver' && usage.gameused >= usage.gamehave) {
        return message.reply(`:x: You already used your \`Gameserver\` slots. Run: !server count`);
    } else if (serverType === 'botserver' && usage.botused >= usage.bothave) {
        return message.reply(`:x: You already used your \`Bot\` server slots. Run: !server count`);
    }

    let msg = await message.reply(`${success} Attempting to create your server, please wait...`);

    axios({
        url: config.pterodactyl.host + "/api/application/servers",
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'Application/vnd.pterodactyl.v1+json',
        },
        data: ServerData,
    }).then(async response => {
        const serverName = srvname ? srvname : args[1];
        const serverId = response.data.attributes.identifier;
        const serverAdminId = response.data.attributes.id;

        await serverData.create({
            ownerID: user.id,
            serverID: serverId,
            serverAdminID: serverAdminId,
            serverName,
            type: serverType
        });

        const serverButton = new Discord.ButtonBuilder()
            .setStyle('Link')
            .setURL(`${config.pterodactyl.host}/server/${serverId}`)
            .setLabel(serverName.length < 25 ? `[${serverName}] Server Link` : `Server Link`);

        const row2 = new Discord.ActionRowBuilder()
            .addComponents([serverButton])
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('ShowSpecs')
                    .setLabel('Show my resources')
                    .setStyle('Success'),
            );

        msg.edit({
            content: null,
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(Discord.Colors.Green)
                    .setTitle(`${success} Server Created Successfully`)
                    .setDescription(`
                    > **Status:** \`${response.statusText}\`
                    > **User ID:** \`${userDB.consoleID}\`
                    > **Server ID:** \`${serverId}\`
                    > **Server Name:** \`${serverName}\`
                    > **Server Type:** \`${args[1].toLowerCase()}\`
                    \n__Got issues?__ **Make a ticket** <#1164497677334085642>
                    `)
            ],
            components: [row2]
        });

        const Collector = msg.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: 300000 });
        const disablerow2 = new Discord.ActionRowBuilder()
            .addComponents([serverButton])
            .addComponents(
                new Discord.ButtonBuilder()
                    .setCustomId('ShowSpecs')
                    .setLabel('Show my resources')
                    .setStyle('Success')
                    .setDisabled(true),
            );

        Collector.on('collect', async i => {
            i.deferUpdate();
            Collector.stop();
            if (i.customId === "ShowSpecs") {
                msg.edit({
                    content: null,
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor(Discord.Colors.Green)
                            .setDescription(`
                            > <:cpu:1183573635072524319> \`350%\`
                            > <:ram:1183573571243610192> \`3GB\`
                            > <:hdd:1183573739456184350> \`15GB\`
                            \n__Got issues?__ **Make a ticket** <#1164497677334085642>
                            `)
                    ],
                    components: [disablerow2]
                });
            }
        });

        const logchannel = client.channels.cache.get(config.logs.createlog);
        if (logchannel) {
            logchannel.send({
                embeds: [
                    new Discord.EmbedBuilder()
                        .addFields(
                            { name: `Server Created`, value: `**User ID:** \`${userDB.consoleID}\`\n**Server Name:** \`${serverName}\`\n**Server Type:** \`${args[1].toLowerCase()}\`` },
                            { name: `Server ID`, value: `\`${response.data.attributes.uuid}\`` },
                            { name: `Server Status`, value: `\`${response.statusText}\`` }
                        )
                        .setColor(Discord.Colors.Red)
                        .setFooter({ text: `User ID: ${userDB.consoleID}` })
                        .setTimestamp()
                ]
            });
        }

        if (serverType === 'gameserver') {
            serverCount.add(message.author.id + '.gameused', 1);
        } else if (serverType === 'botserver') {
            serverCount.add(message.author.id + '.botused', 1);
        }

    }).catch(error => {
        let errorMessage = `${error} Server creation failed`;
        let errorDetails = `${error}`;
        if (error.message.includes('400')) errorDetails = `The node had ran out of allocations/ports!`;
        else if (error.message.includes('504')) errorDetails = `The node is currently offline or having issues`;
        else if (error.message.includes('429')) errorDetails = `Uh oh, This shouldn't happen, Try again in a minute or two.`;

        msg.edit({
            content: null,
            embeds: [
                new Discord.EmbedBuilder()
                    .setColor(Discord.Colors.Red)
                    .addFields({ name: errorMessage, value: errorDetails })
            ]
        });
    });
};
