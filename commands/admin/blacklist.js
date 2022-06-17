const Discord = require('discord.js');
const config = require('../../config.json');
const db = require("quick.db");
module.exports = {
    name: "blacklist",
    category: "Owner",
    description: "Blacklist a user from the bot.",
    run: async (client, message, args) => {
            if (message.author.id !== config.settings.owner) return;
        if (args[0] === "add") {
    
            const user = message.mentions.users.first() || message.guild.members.cache.get(args[1]);
            if (!user) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You Need to moniton a vaild user') ] });
            if (user.id === client.user.id) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist me') ] });
            if (user.id === message.author.id) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist yourself') ] });
            if (user.id === config.settings.owner) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist the owner') ] });
            if (user.bot) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist a bot') ] });
            
            let fetched = db.get(`blacklist_${user.id}`)
            if(!fetched) {
                db.set(`blacklist_${user.id}`, true)
                message.reply({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription(`${user.tag} has been blacklisted`) ] });
            } else {
                return message.reply({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription(`${user.tag} is already blacklisted`) ] });
            }
            

        }

        if (args[0] === "remove") {

            const user = message.mentions.users.first() || message.guild.members.cache.get(args[1]);
            if (!user) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You Need to moniton a vaild user') ] });
            if (user.id === client.user.id) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist me') ] });
            if (user.id === message.author.id) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist yourself') ] });
            if (user.id === config.settings.owner) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist the owner') ] });
            if (user.bot) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist a bot') ] });
            
            let fetched = db.get(`blacklist_${user.id}`)
            if(!fetched) {
                return message.reply({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription(`${user.tag} is not blacklisted`) ] });
            }else{
                db.delete(`blacklist_${user.id}`)
                message.reply({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription(`${user.tag} has been removed from the blacklist`) ] });
            }
        }
    }
}
