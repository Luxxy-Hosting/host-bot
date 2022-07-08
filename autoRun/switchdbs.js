const config = require('../config.json')
const db = require('quick.db')
const pinger = require('minecraft-pinger')
const wait = require('node:timers/promises').setTimeout;
const { default: axios } = require('axios')
const chalk = require('chalk')
const Discord = require('discord.js')
const userData = require('../models/userData');
const oldUserData = new db.table("userData");
module.exports = async (client) => {
    console.log(`${chalk.blue('[ DataBase ]')}`+" Db Switcher Has Started :D")]
    async function runeverything () {
        client.guilds.fetch(config.settings.guildID).members.forEach(member => {
            const oldUserDB = oldUserData.get(member.user.id)
            const userDB = await userData.findOne({ ID: member.user.id });
            if (userDB) {
        axios({
            url: config.pterodactyl.host + "/api/application/users/" + oldUserDB.consoleID,
            method: 'get',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then(async user => {
                client.channels.cache.get('992171639750017024').send({
                    embeds: [
                        new Discord.MessageEmbed()
                        .setColor('#00ff00')
                        .setTitle('Success')
                        .setDescription('User is already in new db \n Username: ' + user.data.attributes.username + '\n Email: ' + user.data.attributes.email + '\n Console ID: ' + userDB.consoleID)
                    ]
                })
                })
                return;
            }
            if (!oldUserDB) {
                client.channels.cache.get('992171639750017024').send({
                    embeds: [
                        new Discord.MessageEmbed()
                        .setColor('#00ff00')
                        .setTitle('Success')
                        .setDescription('User has no account in quickdb database')
                    ]
                })
                return;
            }
        axios({
            url: config.pterodactyl.host + "/api/application/users/" + oldUserDB.consoleID,
            method: 'get',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'Application/vnd.pterodactyl.v1+json',
            },
        }).then(async user => {
            userData({
                ID: message.author.id,
                consoleID: oldUserDB.consoleID,
                email: oldUserDB.email,
                username: user.data.attributes.username,
                linkTime: moment().format("HH:mm:ss"),
                linkDate: moment().format("YYYY-MM-DD"),
            }).save()
            client.channels.cache.get('992171639750017024').send({
                embeds: [
                    new Discord.MessageEmbed()
                    .setColor('#00ff00')
                    .setTitle('Success')
                    .setDescription('User linked successfully! \n Username: ' + user.data.attributes.username + '\n Email: ' + user.data.attributes.email + '\n Console ID: ' + oldUserDB.consoleID)
                ]
            })
           })
            /*           ANTI CRASHING            ¦¦           ANTI CRASHING           */ 
        process.on('unhandledRejection', (reason, p) => {
            console.log(chalk.red(`\n\n\n\n\n[Anti-Crash] unhandled Rejection:`));
            console.log(reason.stack ? String(reason.stack) : String(reason));
            console.log('=== unhandled Rejection ===\n\n\n\n\n');
        });
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            console.log(chalk.red('[Anti-Crash] uncaught Exception Monitor'))
        });
        process.on('exit', (code) => {
        console.log(chalk.red('\n\n\n\n\n[Anti-Crash] exit'));
        console.log(code);
        console.log(chalk.red('=== exit ===\n\n\n\n\n'));
    });
    process.on('multipleResolves', (type, promise, reason) => {
        console.log(chalk.red('\n\n\n\n\n[Anti-Crash] multiple Resolves'));
        console.log(type, promise, reason);
        console.log(chalk.red('=== multiple Resolves ===\n\n\n\n\n'));
    });
        })
    }

    runeverything().catch(err => client.channels.cache.get('992171639750017024').send({content: `this was not post to happen ${err}`}))
    setInterval(() => {
        runeverything()
    }, 3000).catch(err => client.channels.cache.get('992171639750017024').send({content: `this was not post to happen ${err}`}))
  
  /*           ANTI CRASHING            ¦¦           ANTI CRASHING           */ 
        process.on('unhandledRejection', (reason, p) => {
            console.log(chalk.red(`\n\n\n\n\n[Anti-Crash] unhandled Rejection:`));
            console.log(reason.stack ? String(reason.stack) : String(reason));
            console.log('=== unhandled Rejection ===\n\n\n\n\n');
        });
        process.on('uncaughtExceptionMonitor', (err, origin) => {
            console.log(chalk.red('[Anti-Crash] uncaught Exception Monitor'))
        });
        process.on('exit', (code) => {
        console.log(chalk.red('\n\n\n\n\n[Anti-Crash] exit'));
        console.log(code);
        console.log(chalk.red('=== exit ===\n\n\n\n\n'));
    });
    process.on('multipleResolves', (type, promise, reason) => {
        console.log(chalk.red('\n\n\n\n\n[Anti-Crash] multiple Resolves'));
        console.log(type, promise, reason);
        console.log(chalk.red('=== multiple Resolves ===\n\n\n\n\n'));
    });
    
}
