const Discord = require('discord.js');
const config = require(`./config.json`);
const db = require('quick.db')
const userData = require('./models/userData');
const mongoose = require('mongoose')
const colors = require('colors')
// const ServerCount = require('./models/FreeServerCount');

const client = new Discord.Client({ intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES', 'DIRECT_MESSAGES', 'GUILD_PRESENCES', 'GUILD_BANS'], partials: ['MESSAGE', 'CHANNEL', 'REACTION'] });

console.log("index runing . . .")

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
require(`./handlers/mongoose`)(client);
require(`./handlers/anti_crash`)(process);
if(config.settings.consoleSave) require(`./logs/console.log`)()

client.login(config.bot.token);

/**
 /* lavalink status
 */
const { readdirSync } = require("fs");
if(config.settings.LavalinkStats) {
    console.log(colors.green('[LavalinkStats]') + ' is active ')
readdirSync("./events/LavalinkStats/").forEach((file) => {
  const event = require(`./events/LavalinkStats/${file}`);
  let eventName = file.split(".")[0];
  console.log(colors.green(`[LavalinkStats] Loaded Lavalink Status events`));
  client.on(eventName, event.bind(null, client));
});
} else {
    console.log(colors.red('[LavalinkStats]') + ' is Disabled ');
}
