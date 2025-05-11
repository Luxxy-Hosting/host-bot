const userData = require('../../models/userData');
const Discord = require('discord.js');
const config = require('../../config.json')
const axios = require('axios')
module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id })
    if(!userDB) return message.reply(`${error}` + " You dont have an account created. type `!user new` to create one")
    if (message.author.id === '517107022399799331') return message.reply(`${error} You can't delete your owners account`)
    await axios({
        url: config.pterodactyl.host + "/api/application/users/" + userDB.consoleID + "?include=servers",
        method: 'GET',
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'Application/vnd.pterodactyl.v1+json',
        }
    }).then(async response => {
        let servers = response.data.attributes.relationships.servers.data.map(x => x.attributes.id)

        let msg = await message.reply({content: `You are going to delete your account with username: \`${userDB.username}\`. Once you click the yes button all your ${servers.length > 1 ? '\`'+ servers.length + '\` servers' : 'servers'} will be deleted.\n\n⚠️ *This acction is not reversable. once you deleted your account all your data will be lost forever*`, components:[
            new Discord.ActionRowBuilder()
            .addComponents(
				new Discord.ButtonBuilder()
					.setCustomId('DeleteTheAccount')
					.setLabel('Yes')
					.setStyle('Success'),
			)
            .addComponents(
				new Discord.ButtonBuilder()
					.setCustomId('CancelAccountDeletion')
					.setLabel('No')
					.setStyle('Danger'),
			)
        ]}
        )

        const filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 30000 });
    
        collector.on('collect', async i => {
            i.deferUpdate()
            if(i.customId === "DeleteTheAccount") return collector.stop('DeleteTheAccount')
            if(i.customId === "CancelAccountDeletion") return collector.stop('CancelAccountDeletion')
        })

        collector.on('end', async(a, reason) => {

            msg.edit({
                components:[
                    new Discord.ActionRowBuilder()
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('DeleteTheAccount')
                            .setLabel('Yes')
                            .setStyle('Success')
                            .setDisabled(true)
                    )
                    .addComponents(
                        new Discord.ButtonBuilder()
                            .setCustomId('CancelAccountDeletion')
                            .setLabel('No')
                            .setStyle('Danger')
                            .setDisabled(true)
                    )
                ]
            })


            if(reason === 'time'){
                msg.edit({
                    components:[
                        new Discord.ActionRowBuilder()
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId('DeleteTheAccount')
                                .setLabel('Yes')
                                .setStyle('Success')
                                .setDisabled(true)
                        )
                        .addComponents(
                            new Discord.ButtonBuilder()
                                .setCustomId('CancelAccountDeletion')
                                .setLabel('No')
                                .setStyle('Danger')
                                .setDisabled(true)
                        )
                    ]
                })
                return
            }
            if(reason === 'CancelAccountDeletion'){
                msg.edit({embeds:[
                    new Discord.EmbedBuilder()
                    .setTitle(':x: Account Deletion canceled')
                    .setColor(Discord.Colors.Red)
                ]})
                return
            }
            if(reason === 'DeleteTheAccount'){
                if(servers.length > 0){
                    await msg.edit('Deleting servers...')
                    await Promise.all(servers.map(async server => {
                        await axios({
                            url: config.pterodactyl.host + "/api/application/servers/" + server + "/force",
                            method: 'DELETE',
                            followRedirect: true,
                            maxRedirects: 5,
                            headers: {
                                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                                'Content-Type': 'application/json',
                                'Accept': 'Application/vnd.pterodactyl.v1+json',
                            }
                        }).then(() => {}).catch(err => {return msg.edit('Error deleting server')})
                    }))
                }

                await msg.edit('Deleting account . . .')

                await axios({
                    url: config.pterodactyl.host + "/api/application/users/" + userDB.consoleID,
                    method: 'DELETE',
                    followRedirect: true,
                    maxRedirects: 5,
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'Application/vnd.pterodactyl.v1+json',
                    }
                }).then(() => {
                    const userData1 = require('../../models/userData'); userData1.deleteOne({ ID: `${userDB.ID}` }).catch(err => {return console.log(err)})
                    serverCount.set(message.author.id, {
                        gameused: 0,
                        botused: 0,
                        gamehave: 1,
                        bothave: 2
                    })


                    msg.edit('Account Deleted')
                    
                }).catch(err => {
                    msg.edit('There was an error deleting your account')
                    console.log(err)
                })
            }
        })


    }).catch(err=> {
        message.channel.send(`${err}.`)
    })
}
