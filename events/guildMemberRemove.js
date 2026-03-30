const Discord = require("discord.js")
const config = require("../config.json")
const axios = require("axios")

module.exports = async (client, member, guild) => {
    console.log(`${member.user.tag} has left.`)
    const userdb = userData.get(member.id)
    const count = serverCount.get(member.id)
    if (!userdb) {
        console.log('User is not in the database.')
        client.channels.cache.get('942502078172000266').send('🤵 User is not in the database. (quick.db)')
    }
    if(userdb) {
        await axios({
            url: config.pterodactyl.host + "/api/admin/users/" + userData.get(member.id).consoleID + "?include=servers",
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        }).then(async res => {
            const servers1 = (res.data.user?.servers || res.data.user?.relationships?.servers || []).map(x => x.uuid)
            client.channels.cache.get('942502078172000266').send({
                embeds: [
                    new Discord.EmbedBuilder()
                    .setColor(Discord.Colors.Red)
                    .setDescription(` 🦺 ${member.user.tag} has left with consoleid ${userdb.consoleID} with ${servers1.length} servers.`)
                ]
            })
            client.channels.cache.get('942502078172000266').send('deleting.....')
            if (servers1.length > 0) {
                await client.channels.cache.get('942502078172000266').send({
                    embeds: [
                        new Discord.EmbedBuilder()
                        .setColor(Discord.Colors.Red)
                        .setTitle('🦺 Deleting servers...')
                    ]
                })
                await Promise.all(servers1.map(async server => {
                    // await server1.filter(x => x.consolid).map(async server => {})
                    client.channels.cache.get('942502078172000266').send({ embeds: [
                        new Discord.EmbedBuilder()
                        .setColor(Discord.Colors.Red)
                        .setTitle(`🦺 Deleting server ${server}...`)
                    ]})
                    await axios({
                        url: config.pterodactyl.host + "/api/admin/servers/" + server + "/force",
                        method: 'DELETE',
                        followRedirect: true,
                        maxRedirects: 5,
                        headers: {
                            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        }
                    }).then(() => {
                        console.log('Server deleted.')
                    })
                }
                ))
            }
            await axios({
                url: config.pterodactyl.host + "/api/admin/users/" + userData.get(member.id).consoleID,
                method: 'DELETE',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                }
            }).then(() => {
                userData.delete(member.user.id)
                serverCount.delete(member.user.id)
                client.channels.cache.get('942502078172000266').send({
                    embeds: [
                        new Discord.EmbedBuilder()
                        .setTitle('🦺 Deleted user.')
                        .setColor(Discord.Colors.Green)
                    ]
            })
            }
            )
        })
    }
}
