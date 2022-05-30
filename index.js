const Discord = require('discord.js');
const config = require(`./config.json`);
const db = require('quick.db')
const userData = require('./models/userData');
const mongoose = require('mongoose')
const colors = require('colors')
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

if(config.settings.consoleSave) require(`./logs/console.log`)()

client.login(config.bot.token);

Anticrash script for your codes
/*           ANTI CRASHING            ¦¦           ANTI CRASHING           */ 
process.on('unhandledRejection', (reason, p) => {
    console.log('\n\n\n\n\n[Anti-Crash] unhandled Rejection:'.toUpperCase().red.dim);
    console.log(reason.stack ? String(reason.stack) : String(reason));
    console.log('=== unhandled Rejection ===\n\n\n\n\n'.toUpperCase().red.dim);
  });
  process.on("uncaughtException", (err, origin) => {
    console.log('\n\n\n\n\n\n[Anti-Crash] uncaught Exception'.toUpperCase().red.dim);
    console.log(err.stack.yellow.dim ? err.stack.yellow.dim : err.yellow.dim)
    console.log('=== uncaught Exception ===\n\n\n\n\n'.toUpperCase().red.dim);
  })
  process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log('[Anti-Crash] uncaught Exception Monitor'.toUpperCase().red.dim);
  });
  process.on('exit', (code) => {
    console.log('\n\n\n\n\n[Anti-Crash] exit'.toUpperCase().red.dim);
    console.log(code.yellow.dim);
    console.log('=== exit ===\n\n\n\n\n'.toUpperCase().red.dim);
  });
  process.on('multipleResolves', (type, promise, reason) => {
    console.log('\n\n\n\n\n[Anti-Crash] multiple Resolves'.toUpperCase().red.dim);
    console.log(type, promise, reason);
    console.log('=== multiple Resolves ===\n\n\n\n\n'.toUpperCase().red.dim);
  }); 
