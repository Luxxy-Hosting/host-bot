const config = require('../../config.json')
const Discord = require('discord.js');
const axios = require('axios');
const userData = require('../../models/userData');
const serverData = require('../../models/serverData');

module.exports = {
    name: "delete",
    category: "server",
    description: "Delete one of your servers",
    options: [
        {
            name: "server_id",
            description: "The ID of the server to delete",
            type: Discord.ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    ownerOnly: false,
    run: async (client, interaction) => {
        const userDB = await userData.findOne({ ID: interaction.user.id })
        if (!userDB) {
            return interaction.reply(`${global.error} You dont have an account created. Use \`/user new\` to create one`);
        }

        let serverId = interaction.options.getString('server_id');
        if (serverId.match(/[0-9a-z]+/i) == null)
            return interaction.reply("Only use english characters for server ID.");

        serverId = serverId.split('-')[0];

        await interaction.reply('Let me check if this is your server, please wait . . .');

        try {
            const response = await axios({
                url: config.pterodactyl.host + "/api/application/users/" + userDB.consoleID + "?include=servers",
                method: 'GET',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            });

            const preoutput = response.data.attributes.relationships.servers.data
            const output = await preoutput.find(srv => srv.attributes ? srv.attributes.identifier == serverId : false)

            if (!output) return interaction.editReply(`:x: I could not find that server`)
            if (!output.attributes.user === userDB.consoleID) return interaction.editReply(`:x: You are not the owner of this server`)

            await interaction.editReply({
                content: `Are you sure you want to delete \`${output.attributes.name}\`? once you delete your server you will never be able to recover it and all data and files will be lost forever!`,
                components: [
                    new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId('AcceptDelete')
                                .setLabel('Yes')
                                .setStyle('Success'),
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId('RejectDelete')
                                .setLabel('No')
                                .setStyle('Danger'),
                        )
                ]
            });

            const filter = i => i.user.id === interaction.user.id;
            const Collector = interaction.createMessageComponentCollector({ filter, time: 300000 });

            Collector.on('collect', async i => {
                i.deferUpdate()
                Collector.stop()
                if (i.customId === "AcceptDelete") {
                    await interaction.editReply({
                        content: `Deleting Server \n Please wait . . .`,
                        components: []
                    });

                    try {
                        await axios({
                            url: config.pterodactyl.host + "/api/application/servers/" + output.attributes.id,
                            method: 'get',
                            followRedirect: true,
                            maxRedirects: 5,
                            headers: {
                                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                                'Content-Type': 'application/json',
                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                            }
                        });

                        await axios({
                            url: config.pterodactyl.host + "/api/application/servers/" + output.attributes.id + "/force",
                            method: 'DELETE',
                            followRedirect: true,
                            maxRedirects: 5,
                            headers: {
                                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                                'Content-Type': 'application/json',
                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                            }
                        });

                        await interaction.editReply(`${global.success} Server deleted!`);

                        if (!global.serverCount.get(interaction.user.id)) return interaction.followUp('WTF? how did u get a server?')
                        
                        const serverDataRecord = await serverData.findOne({ serverAdminID: output.attributes.id });
                        if (serverDataRecord) {
                            if (serverDataRecord.type === 'gameserver') {
                                global.serverCount.subtract(interaction.user.id + '.gameused', 1)
                                console.log('gameused')
                            } else if (serverDataRecord.type === 'botserver') {
                                global.serverCount.subtract(interaction.user.id + '.botused', 1)
                                console.log('botused')
                            }
                            await serverData.deleteOne({ serverAdminID: output.attributes.id });
                        }

                    } catch (err) {
                        await interaction.editReply(`Error: ${err.message}`);
                    }
                }
                if (i.customId === "RejectDelete") {
                    await interaction.editReply({
                        content: `${global.success} Server deletion canceled`,
                        components: []
                    });
                }
            });

            Collector.on('end', () => {
                // Components are already cleared in the collect handler
            });

        } catch (err) {
            await interaction.editReply(`Error: ${err.message}`);
        }
    }
}