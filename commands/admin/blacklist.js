const Discord = require('discord.js');
const config = require('../../config.json');
module.exports = {
    name: "blacklist",
    category: "Owner",
    description: "Blacklist a user from the bot.",
    run: async (client, message, args) => {
        if (args[0] === "add") {
            if (!message.author.id === config.settings.owner) return;
    
            const user = message.mentions.users.first() || message.guild.members.cache.get(args[1]);
            if (!user) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You Need to moniton a vaild user') ] });
            if (user.id === client.user.id) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist me') ] });
            if (user.id === message.author.id) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist yourself') ] });
            if (user.id === config.settings.owner) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist the owner') ] });
            if (user.bot) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist a bot') ] });

            blacklist.set(user.id, {
                status: true,
            });

            message.reply({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription(`${user.tag} has been blacklisted`) ] });

        }

        if (args[0] === "remove") {
            if (!message.author.id === config.settings.owner) return;

            const user = message.mentions.users.first() || message.guild.members.cache.get(args[1]);
            if (!user) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You Need to moniton a vaild user') ] });
            if (user.id === client.user.id) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist me') ] });
            if (user.id === message.author.id) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist yourself') ] });
            if (user.id === config.settings.owner) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist the owner') ] });
            if (user.bot) return message.channel.send({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription('You can\'t blacklist a bot') ] });
            
            blacklist.delete(user.id);

            message.reply({ embeds: [ new Discord.MessageEmbed().setColor('#36393f').setDescription(`${user.tag} has been removed from the blacklist`) ] });
        }
    }
}