const Discord = require("discord.js");
const config = require("../../config.json");
const axios = require("axios");

module.exports = {
    name: "delete",
    category: "server",
    description: "Deletes a server",
    options: [{
        name: "serverid",
        description: "The id of the server to delete",
        type: "STRING",
        required: true
    }],
    ownerOnly: false,
    run: async (client, interaction, args) => {
        const serverid = interaction.options.getString("serverid");

        if (!userData.get(interaction.user.id)) {
            interaction.reply(":x: You dont have an account created. type `!user new` to create one");
            return;
        }

        axios({
            url: config.pterodactyl.host + "/api/application/users/" + userData.get(interaction.user.id).consoleID + "?include=servers",
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).then(async (response) => {
            const preoutput = response.data.attributes.relationships.servers.data
            const output = await preoutput.find(srv => srv.attributes ? srv.attributes.identifier == serverid : false)

            if(!output) return interaction.reply(`:x: I could not find that server`)

            if (output.attributes.user !== userData.get(interaction.user.id).consoleID) return interaction.reply(`:x: You are not the owner of this server`)

            const msg = interaction.reply({
                content: `Are you sure you want to delete \`${output.attributes.name}\`? once you delete your server you will never be able to recover it and all data and files will be lost forever!`,
                components:[
                    new Discord.MessageActionRow()
                    .addComponents(
                        new Discord.MessageButton()
                            .setCustomId('AcceptDelete')
                            .setLabel('Yes')
                            .setStyle('SUCCESS'),
                    )
                    .addComponents(
                        new Discord.MessageButton()
                            .setCustomId('RejectDelete')
                            .setLabel('No')
                            .setStyle('DANGER'),
                    )
                ],
                fetchReply: true
            })

            const Collector = interaction.channel.createMessageCollector({ filter: fn => fn, time: 300000, componentType: 'BUTTON' });

            Collector.on('collect', async i => {
                Collector.stop()
                await interaction.deferReply()
                if(i.user.id !== interaction.user.id) return msg.edit(`:x: You can only use this command by yourself`)
                if(i.customId === "AcceptDelete") {
                    msg.edit({
                        content: `Deleting Server \n Please wait . . .`,
                    })
    
                    axios({
                        url: config.pterodactyl.host + "/api/application/servers/" + output.attributes.id + "/force",
                        method: 'DELETE',
                        followRedirect: true,
                        maxRedirects: 5,
                        headers: {
                            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                            'Content-Type': 'application/json',
                            'Accept': 'Application/vnd.pterodactyl.v1+json',
                        }
                    }).then(() => {
                        msg.edit(`${success} Server deleted!`)
                        if(!serverCount.get(interaction.user.id)) return msg.edit('WTF? how did u got a server?')
                        serverCount.subtract(interaction.user.id + '.used', 1)
                    }).catch(err => {
                        msg.edit(`Error: ${err}`)
                    })
    
                }
                if(i.customId === "RejectDelete") {
                    interaction.followUp({
                        content: `${success} Server deletion canceled`,
                    })
                }
            })
    
            Collector.on('end',() => {
                interaction.editReply({components:[]})
            })
        })
    }
}