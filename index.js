const Discord = require('discord.js');
const config = require(`./config.json`);
const db = require('quick.db')
const userData = require('./models/userData');
const mongoose = require('mongoose')
// const ServerCount = require('./models/FreeServerCount');

const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'DIRECT_MESSAGES', 'GUILD_PRESENCES', 'GUILD_BANS'], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

console.log("index runing . . .")

mongoose.connect(config.settings.mongoDB, {
    useNewUrlParser: true,
    keepAlive: true,
    useUnifiedTopology: true
}).then(()=>{
    console.log('Connected to the Mongoose Database')
}).catch((err) =>{
    console.log(err)
});

client.snipes = new Discord.Collection();
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
global.userData = new userData;
global.serverCount = new db.table('FreeServerCount');
global.invinfo = new db.table("InviteInfo")
global.invitedBy = new db.table("InvitedByInfo")
global.domains = new db.table("ProxiedDomains")
global.dir = __dirname;
client.embedColor = "#0099ff"

global.error = "<:No:979776354486726726>"
global.success = "<:yes:964979709945470977>"

require("./handlers/music")(client);
require(`./handlers/event_handler`)(client);
require(`./handlers/command_handler`)(client);
require(`./handlers/anti_crash`)(process);

if(config.settings.consoleSave) require(`./logs/console.log`)()

client.login(config.bot.token);