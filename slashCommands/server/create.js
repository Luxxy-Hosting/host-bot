const Discord = require("discord.js");
const config = require("../../config.json");
const axios = require("axios");
const UserDatadata = require("../../models/userData");

module.exports = {
    name: "create",
    category: "server",
    description: "Creates a new server",
    options: [{
        name: "type",
        description: "The type of server to create",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
        choices: [
            {
                name: 'aio',
                value: 'aio'
            },
            {
                name: 'codeserver',
                value: 'codeserver'
            },
            {
                name: 'dotnet',
                value: 'dotnet'
            },
            {
                name: 'gitea',
                value: 'gitea'
            },
            {
                name: 'golang',
                value: 'golang'
            },
            {
                name: 'mongodb',
                value: 'mongodb'
            },
            {
                name: 'nginx',
                value: 'nginx'
            },
            {
                name: 'nodejs',
                value: 'nodejs'
            },
            {
                name: 'python',
                value: 'python'
            },
            {
                name: 'redbot',
                value: 'redbot',
            },
            {
                name: 'redis',
                value: 'redis'
            },
            {
                name: 'ruby',
                value: 'ruby'
            },
            {
                name: 'share',
                value: 'share'
            },
            {
                name: 'sharex',
                value: 'sharex'
            },
            {
                name: 'uptime-kuma',
                value: 'uptime-kuma'
            }
        ],
    },{
        name: "name",
        description: "The name of the server",
        type: Discord.ApplicationCommandOptionType.String,
        required: true,
    }],
    ownerOnly: false,
    run: async (client, interaction, args) => {
        const type = interaction.options.getString('type');
        const name = interaction.options.getString('name');

        const userData = await UserDatadata.findOne({ ID: interaction.user.id });

        if (!userData) {
            interaction.reply(":x: You dont have an account created. type `!user new` to create one");
            return;
        }
        return interaction.reply("working in development")

        if(!serverCount.get(interaction.user.id)) {
            serverCount.set(interaction.user.id, {
                mineused: 0,
                botused: 0,
                minehave: 1,
                bothave: 2
            })
        }else if(serverCount.get(interaction.user.id).used >= serverCount.get(interaction.user.id).have) return interaction.reply(`:x: You already used your all server slots. For more info run: !server count`)

        let ServerData

        try{
            ServerData = require(`../../server_creation/${type.toLowerCase()}.js`)(userData.consoleID, name ? name : type, config.pterodactyl.depolymentlocations)
        }catch(err){
            interaction.reply(`${error} I could no find any server type with the name: \`${type.toLowerCase()}\`\nType \`!server create list\` for more info`)
            return
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
        }).then(response => {
            console.log(`[${new Date().toLocaleString()}] [${interaction.user.tag}] Created server: ${response.data.attributes.name}`)

            const serverButton = new Discord.ButtonBuilder()
            .setStyle('Link')
            .setURL(`${config.pterodactyl.host}/server/${response.data.attributes.identifier}`)
            if (response.data.attributes.name.length < 25) {
                serverButton.setLabel(`[${response.data.attributes.name}] Server Link`)
            } else {
                serverButton.setLabel(`Server Link`)
            }

            const row2 = new Discord.ActionRowBuilder()
            .addComponents([serverButton])

            interaction.reply({
                content: null,
                embeds:[
                    new Discord.EmbedBuilder()
                    .setColor(Discord.Colors.Green)
                    .setTitle(`${success} Server Created Successfully`)
                    .setDescription(`
                    > **Status:** \`${response.statusText}\`
                    > **User ID:** \`${userData.consoleID}\`
                    > **Server ID:** \`${response.data.attributes.identifier}\`
                    > **Server Name:** \`${name ? type.toLowerCase() : type}\`
                    > **Server Type:** \`${args[1].toLowerCase()}\`
                    `)
                ],
                components: [row2]
            })

            serverCount.add(interaction.user.id + '.used', 1)
        }).catch(err => {
            if (error == "Error: Request failed with status code 400") {
                interaction.reply({
                    content: null,
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setColor(Discord.Colors.Red)
                        .addFields({ name: `${error} Server creation failed`, value: `The node had ran out of allocations/ports!`, inline: false })
                    ]
                })
            } else if (error == "Error: Request failed with status code 504") {
                interaction.reply({
                    content: null,
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setColor(Discord.Colors.Red)
                        .addFields({ name: `${error} Server creation failed`, value: `The node is currently offline or having issues`, inline: false})
                    ]
                })
            } else if (error == "Error: Request failed with status code 429") {
                interaction.reply({
                    content: null,
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setColor(Discord.Colors.Red)
                        .addFields({ name: `${error} Server creation failed`, value: `Uh oh, This shouldn\'t happen, Try again in a minute or two.`, inline: false})
                        ]
                })
            } else {
                interaction.reply({
                    content: null,
                    embeds:[
                        new Discord.EmbedBuilder()
                        .setColor(Discord.Colors.Red)
                        .addFields({ name: `${error} Server creation failed`, value: `idk the error 💀.`})
                    ]
                }) 
            }
        })
    }
}