const Discord = require("discord.js")
const config = require("../config.json")
const axios = require("axios")

module.exports = async (client, member, guild) => {
    console.log(`${member.user.tag} has left.`)
    const userdb = userData.get(member.id)
    const count = serverCount.get(member.id)
    if (!userdb) {
        console.log('User is not in the database.')
        client.guilds.cache.get('942502078172000266').send('🤵 User is not in the database.')
    }
    if(userdb) {
        await axios({
            url: config.pterodactyl.host + "/api/application/users/" + userData.get(member.id).consoleID + "?include=servers",
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).then(async res => {
            const servers1 = res.data.attributes.relationships.servers.data.map(x => x.attributes.id)
            client.channels.cache.get('942502078172000266').send({
                embeds: [
                    new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setDescription(` 🦺 ${member.user.tag} has left with consoleid ${userdb.consoleID} with ${servers1.length} servers.`)
                ]
            })
            client.channels.cache.get('942502078172000266').send('deleting.....')
            if (servers1.length > 0) {
                await client.channels.cache.get('942502078172000266').send({
                    embeds: [
                        new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('🦺 Deleting servers...')
                        .setColor(`RED`)
                    ]
                })
                await Promise.all(servers1.map(async server => {
                    // await server1.filter(x => x.consolid).map(async server => {})
                    client.channels.cache.get('942502078172000266').send({ embeds: [
                        new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`🦺 Deleting server ${server}...`)
                    ]})
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
                    }).then(() => {
                        console.log('Server deleted.')
                    })
                }
                ))
            }
            await axios({
                url: config.pterodactyl.host + "/api/application/users/" + userData.get(member.id).consoleID,
                method: 'DELETE',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            }).then(() => {
                userData.delete(member.user.id)
                serverCount.delete(member.user.id)
                client.channels.cache.get('942502078172000266').send({
                    embeds: [
                        new Discord.MessageEmbed()
                        .setTitle('🦺 Deleted user.')
                        .setColor(`GREEN`)
                    ]
            })
            }
            )
        })
    }
}