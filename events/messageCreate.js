const config = require("../config.json")
const wait = require('node:timers/promises').setTimeout;
const chalk = require('chalk');
const { Discord, MessageEmbed } = require('discord.js');
const db = require("quick.db");
module.exports = async (client, message) => {
    let blacklisted = db.get(`blacklist_${message.author.id}`);
    if(message.author?.bot) return
//    if(message.channel.type == "DM") return client.channels.cache.get(config.logs.dms).send(`${message.author.tag} (${message.author.id}): ${message.content}`)
    
    if(message.author.id === '517107022399799331' && message.content.toLowerCase().startsWith('eval')) return client.commands.get('eval').run(client, message, message.content.split(/ +/))
    
    if(blacklisted == true) return;

    function deleteMessage() {
        //console.log("deleted " + message.content + " from " + message.author.tag)
        message.delete(1);
        message.channel.send(`${message.author} You cannot advertise in here.`)
    }
    const invites = ["discord.gg/", "discord.com/invite/"];
    if(message.content.includes("discord.gg/")) {
        deleteMessage();
    }
    if(message.content.includes("discord.com/invite/")) {
        deleteMessage();
    }

    const array = require(`../scam.json`)
    if (array.some(word => message.content.toLowerCase().includes(word))) {
        try {
        message.delete({ reason: 'AntiScam' });
        message.guild.bans.create(message.author, { reason: 'AntiScam'})
        const logEmbedDesc = 'Scam link blocked!'
        .replace(/{MENTION}/g, message.author.tag)
        .replace(/{ID}/g, message.author.id)
        .replace(/{MESSAGE}/g, message.content)
        .replace ("://", ": //");
        const logChannel = client.channels.cache.get(config.channelID.logs)
        const logEmbed = new MessageEmbed()
        .setColor(`RED`)
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(logEmbedDesc)
        .setTimestamp()
        .addFields([{ name: 'Action', value: 'Ban' }]);
        await logChannel.send({ embeds: [logEmbed] });
       }
      catch (error){
        console.error(error);
        await logChannel.send(error);
      }
    }
    
    if(message.channel.id === config.channelID.suggestions && !message.content.startsWith('>')){
        message.react('👍')
        await wait(500)
        message.react('👎')
        return 
    }

    // suggested by astrexx
    if (message.author.bot === false) {
        if(message.mentions.members.size > 4) 
        {
            message.delete();
            message.guild.members.kick(message.author.id);
            message.channel.send(`${message.author.tag} has been kicked for spamming mentions.`);
        }
    }

    if(config.settings.maintenance === true && !message.member.roles.cache.has(config.roleID.administrator)) return
    if(!message.content.toLowerCase().startsWith(config.bot.prefix) || message.author.bot) return;
    if(message.content.length <= config.bot.prefix.length) return 

    const args = message.content.slice(config.bot.prefix.length).split(/ +/);
    const cmd = args.shift().toLowerCase();
    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));
    try{
        if(cmd === 'user'){
            try{
                if(!args[0]) return require('../commands/user/help.js')(client, message, args)
                await console.log(chalk.red(`[#${message.channel.name}]`) + chalk.yellow(` ${message.author.tag} (${message.author.id})`) + chalk.green(` ${message.content}`))
                require(`../commands/user/${args[0]}.js`)(client, message, args)
            }catch(err){console.log(err).toString()}
            return
        }else if(cmd === 'server'){
            try{
                if(!args[0]) return require('../commands/server/help.js')(client, message, args)
                await console.log(chalk.red(`[#${message.channel.name}]`) + chalk.yellow(` ${message.author.tag} (${message.author.id})`) + chalk.green(` ${message.content}`))
                require(`../commands/server/${args[0]}.js`)(client, message, args)
            }catch(err){console.log(err).toString()}
            return
        }else if(cmd === 'staff'){
            if(!message.member.roles.cache.has(config.roleID.support)) return
            try{
                if(!args[0]) return require('../commands/staff/help.js')(client, message, args)
                await console.log(chalk.red(`[#${message.channel.name}]`) + chalk.yellow(` ${message.author.tag} (${message.author.id})`) + chalk.green(` ${message.content}`))
                require(`../commands/staff/${args[0]}.js`)(client, message, args)
            }catch(err){console.log(err).toString()}
            return
        }else if(cmd === 'music'){
            try{
                if(!args[0]) return require('../commands/music/help.js')(client, message, args)
                await console.log(chalk.red(`[#${message.channel.name}]`) + chalk.yellow(` ${message.author.tag} (${message.author.id})`) + chalk.green(` ${message.content}`))
                require(`../commands/music/${args[0]}.js`)(client, message, args)
            }catch(err){console.log(err).toString()}
            return
        }


        if(!command) return
        await console.log(chalk.red(`[#${message.channel.name}]`) + chalk.yellow(` ${message.author.tag} (${message.author.id})`) + chalk.green(` ${message.content}`))
        command.run(client, message, args);
    }catch(err){}
}
