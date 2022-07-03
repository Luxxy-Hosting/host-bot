const Discord = require('discord.js');
const config = require(`./config.json`);
const db = require('quick.db')
const handler = require("./handlers/loadslash");

const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'DIRECT_MESSAGES', 'GUILD_PRESENCES', 'GUILD_BANS', 'GUILD_MESSAGE_REACTIONS'], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

console.log("index runing . . .")

client.snipes = new Discord.Collection();
client.commands = new Discord.Collection();
client.slash = new Discord.Collection();
client.events = new Discord.Collection();
global.userData = new db.table("userData");
global.serverCount = new db.table("FreeServerCount");
global.invinfo = new db.table("InviteInfo")
global.invitedBy = new db.table("InvitedByInfo")
global.domains = new db.table("ProxiedDomains")
global.codes = new db.table('Codes')
global.blacklist = new db.table('Blacklist')
global.dir = __dirname;
client.embedColor = "#0099ff"

global.error = "<:No:979776354486726726>"
global.success = "<:yes:964979709945470977>"

require("./handlers/music")(client);
require(`./handlers/event_handler`)(client);
require(`./handlers/command_handler`)(client);
require(`./handlers/mongoose`)(client);
require(`./handlers/anti_crash`)(process);
handler.loadSlashCommands(client);

if(config.settings.consoleSave) require(`./logs/console.log`)()

client.login(config.bot.token);


const UserData1 = require('./models/userData.js')
const { default: axios } = require('axios')
client.on('guildMemberRemove', async member => {
    const UserDB = await UserData1.findOne({ ID: member.id })
    if (!UserDB) {
        console.log('User is not in the database.')
        client.channels.cache.get('942502078172000266').send('🤵 User is not in the database. (mongoose)')
    }
    if (UserDB) {
        await axios({
            url: config.pterodactyl.host + "/api/application/users/" + UserDB.consoleID + "?include=servers",
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            }
        }).then(async res => {
            const servers1 = res.data.attributes.relationships.servers.data.map(e => e.attributes.id)
            client.channels.cache.get('942502078172000266').send({
                embeds: [
                    new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setDescription(` 🦺 ${member.user.tag} has left with consoleid ${UserDB.consoleID} with ${servers1.length} servers.`)
                ]
            })
            client.channels.cache.get('942502078172000266').send('deleting.....')
            if (servers1.length > 0) {
                await client.channels.cache.get('942502078172000266').send({
                    embeds: [
                        new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle('🦺 Deleting servers...')
                    ]
                })
                await Promise.all(servers1.map(async server => {
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
                    }).then(async res => {
                        client.channels.cache.get('942502078172000266').send({ embeds: [
                            new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(`🦺 Server ${server} deleted.`)
                        ]})
                    }
                    ).catch(err => {
                        client.channels.cache.get('942502078172000266').send({ embeds: [
                            new Discord.MessageEmbed()
                            .setColor('#0099ff')
                            .setTitle(`🦺 Error deleting server ${server}`)
                        ]})
                    }
                    )
                }))
            }
            await UserData1.deleteOne({ ID: member.id })
            await axios({
                url: config.pterodactyl.host + "/api/application/users/" + UserDB.consoleID,
                method: 'DELETE',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'Application/vnd.pterodactyl.v1+json',
                }
            }).then(async res => {
                client.channels.cache.get('942502078172000266').send({ embeds: [
                    new Discord.MessageEmbed()
                    .setColor('#0099ff')
                    .setTitle(`🦺 User ${UserDB.consoleID} deleted.`)
                ]})
            })
        })
    }
})