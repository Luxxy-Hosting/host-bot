const Discord = require("discord.js");
const config = require("../../config.json");
const axios = require("axios");
const UserDatadata = require("../../models/userData");

const serverCount = new Map(); // Temp server slot store, replace with persistent db

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
                { name: "Paper", value: "paper" },
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
        return interaction.reply(`:x: This command is not available yet. Please check back later.`);
        const type = interaction.options.getString('type');
        const name = interaction.options.getString('name');

        const userData = await UserDatadata.findOne({ ID: interaction.user.id });

        if (!userData) {
            return interaction.reply(":x: You don't have an account. Type `!user new` to create one.");
        }

        if (!serverCount.get(interaction.user.id)) {
            serverCount.set(interaction.user.id, {
                used: 0,
                have: 2
            });
        }

        const userServers = serverCount.get(interaction.user.id);

        if (userServers.used >= userServers.have) {
            return interaction.reply(`:x: All server slots used. Run \`!server count\` for more info.`);
        }

        let ServerData;

        try {
            const generateData = require(`../../server_creation/${type.toLowerCase()}.js`);
            ServerData = generateData(userData.consoleID, name, config.pterodactyl.depolymentlocations);
        } catch (err) {
            return interaction.reply(`❌ No server type found: \`${type.toLowerCase()}\`. Use \`!server create list\` to see available types.`);
        }

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

            const server = response.data.attributes;

            const serverButton = new Discord.ButtonBuilder()
                .setStyle('Link')
                .setURL(`${config.pterodactyl.host}/server/${server.identifier}`)
                .setLabel(server.name.length < 25 ? `[${server.name}] Server Link` : `Server Link`);

            const row = new Discord.ActionRowBuilder().addComponents(serverButton);

            await interaction.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(Discord.Colors.Green)
                        .setTitle(`✅ Server Created Successfully`)
                        .setDescription(`
> **Status:** \`${response.statusText}\`
> **User ID:** \`${userData.consoleID}\`
> **Server ID:** \`${server.identifier}\`
> **Server Name:** \`${server.name}\`
> **Server Type:** \`${type.toLowerCase()}\`
                        `)
                ],
                components: [row]
            });

            userServers.used += 1;
            serverCount.set(interaction.user.id, userServers);

        } catch (error) {
            let errorMsg = `idk the error 💀.`;

            if (error.message.includes("400")) {
                errorMsg = `The node ran out of allocations/ports!`;
            } else if (error.message.includes("504")) {
                errorMsg = `The node is currently offline or having issues.`;
            } else if (error.message.includes("429")) {
                errorMsg = `Rate limit hit. Try again in a minute.`;
            }

            await interaction.reply({
                embeds: [
                    new Discord.EmbedBuilder()
                        .setColor(Discord.Colors.Red)
                        .addFields({ name: `❌ Server creation failed`, value: errorMsg })
                ]
            });
        }
    }
};
