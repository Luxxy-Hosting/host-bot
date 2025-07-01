const Discord = require("discord.js");
const config = require("../../config.json");
const axios = require("axios");
const userData = require("../../models/userData");
const serverData = require("../../models/serverData");

const locations = config.locations;

module.exports = {
    name: "create",
    category: "server",
    description: "Creates a new server",
    options: [
        {
            name: "type",
            description: "The type of server to create",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
            choices: [
                { name: "Paper (Minecraft)", value: "paper" },
                { name: "Purpur (Minecraft)", value: "purpur" },
                { name: "Bedrock (Minecraft)", value: "bedrock" },
                { name: "PocketmineMP (Minecraft)", value: "pocketminemp" },
                { name: "Fabric (Minecraft)", value: "fabric" },
                { name: "Vanilla MC (Minecraft)", value: "vanillamc" },
                { name: "NodeJS (Bot)", value: "nodejs" },
                { name: "Python (Bot)", value: "python" },
                { name: "AIO (Bot)", value: "aio" },
                { name: "Nginx (Web)", value: "nginx" },
                { name: "Uptime-Kuma (Web)", value: "uptimekuma" },
            ],
        },
        {
            name: "name",
            description: "The name of the server",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    ownerOnly: false,
    run: async (client, interaction) => {
        const type = interaction.options.getString('type');
        const name = interaction.options.getString('name');
        const user = interaction.user;

        if (!global.serverCount.get(user.id)) {
            await global.serverCount.set(user.id, {
                gameused: 0,
                botused: 0,
                gamehave: 1,
                bothave: 2
            });
        }

        const userDB = await userData.findOne({ ID: user.id });
        if (!userDB) return interaction.reply(`${global.error} You dont have an account created. Use \`/user new\``)

        let ServerData, serverType;
        let locationID = null;

        const rowLocation = new Discord.ActionRowBuilder().addComponents(
            locations.map(loc => new Discord.ButtonBuilder()
                .setCustomId(`location_${loc.id}`)
                .setLabel(loc.label)
                .setStyle(Discord.ButtonStyle.Primary))
        );

        await interaction.reply({ content: '> 🌍 Choose server deployment location:', components: [rowLocation] });
        const filter = i => i.user.id === user.id && i.customId.startsWith('location_');
        const collector = interaction.createMessageComponentCollector({ filter, time: 10000, max: 1 });

        collector.on('collect', async i => {
            await i.deferUpdate();
            locationID = parseInt(i.customId.split('_')[1]);
            collector.stop();
        });

        collector.on('end', async collected => {
            await interaction.editReply({ content: collected.size ? '✅ Location selection done.' : ':x: You did not select a location in time.', components: [] });

            if (!locationID) return interaction.followUp(':x: No location selected. Please try again.');
            console.log(`Location selected: ${locationID}`);
            
            try {
                const creationModule = require(`../../server_creation/${type.toLowerCase()}.js`);
                const result = creationModule(userDB.consoleID, name, locationID);
                ServerData = result.data;
                serverType = result.serverType;
            } catch (err) {
                console.log(err);
                return interaction.followUp(`${global.error} I could not find any server type with the name: \`${type}\``);
            }

            const usage = global.serverCount.get(user.id);
            if (serverType === 'gameserver' && usage.gameused >= usage.gamehave) {
                return interaction.followUp(`:x: You already used your \`Gameserver\` slots. Run: /server count`);
            } else if (serverType === 'botserver' && usage.botused >= usage.bothave) {
                return interaction.followUp(`:x: You already used your \`Bot\` server slots. Run: /server count`);
            }

            await interaction.followUp(`${global.success} Attempting to create your server, please wait...`);

            try {
                const response = await axios({
                    url: config.pterodactyl.host + "/api/application/servers",
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                    },
                    data: ServerData,
                });

                const serverName = name;
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

                await interaction.editReply({
                    content: null,
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor(Discord.Colors.Green)
                            .setTitle(`${global.success} Server Created Successfully`)
                            .setDescription(`
                            > **Status:** \`${response.statusText}\`
                            > **User ID:** \`${userDB.consoleID}\`
                            > **Server ID:** \`${serverId}\`
                            > **Server Name:** \`${serverName}\`
                            > **Server Type:** \`${type.toLowerCase()}\`
                            \n__Got issues?__ **Make a ticket** <#1164497677334085642>
                            `)
                    ],
                    components: [row2]
                });

                const Collector = interaction.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 300000 });
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
                        await interaction.editReply({
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

                if (serverType === 'gameserver') {
                    global.serverCount.add(interaction.user.id + '.gameused', 1);
                } else if (serverType === 'botserver') {
                    global.serverCount.add(interaction.user.id + '.botused', 1);
                }

            } catch (error) {
                let errorMessage = `${global.error} Server creation failed`;
                let errorDetails = `${error}`;
                if (error.message.includes('400')) errorDetails = `The node had ran out of allocations/ports!`;
                else if (error.message.includes('504')) errorDetails = `The node is currently offline or having issues`;
                else if (error.message.includes('429')) errorDetails = `Uh oh, This shouldn't happen, Try again in a minute or two.`;

                await interaction.editReply({
                    content: null,
                    embeds: [
                        new Discord.EmbedBuilder()
                            .setColor(Discord.Colors.Red)
                            .addFields({ name: errorMessage, value: errorDetails })
                    ]
                });
            }
        });
    }
};
