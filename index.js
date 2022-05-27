const Discord = require('discord.js');
const config = require(`./config.json`);
const db = require('quick.db')

const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'DIRECT_MESSAGES', 'GUILD_PRESENCES', 'GUILD_BANS'], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

console.log("index runing . . .")

client.snipes = new Discord.Collection();
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
global.userData = new db.table("userData");
global.serverCount = new db.table("FreeServerCount");
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
