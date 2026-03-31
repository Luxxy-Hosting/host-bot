const { ContainerBuilder, MessageFlags } = require('discord.js');
const config = require('../../config.json');
const db = require("quick.db");
const { C, V2, errorMsg, successMsg } = require('../../helpers/components');

module.exports = {
    name: "blacklist",
    category: "Owner",
    description: "Blacklist a user from the bot.",
    run: async (client, message, args) => {
        if (message.author.id !== config.settings.owner) return;
        
        if (args[0] === "add") {
            const user = message.mentions.users.first() || message.guild.members.cache.get(args[1]);
            if (!user) return message.channel.send({ components: [errorMsg('Missing User', 'You need to mention a valid user.')], ...V2 });
            if (user.id === client.user.id) return message.channel.send({ components: [errorMsg('Denied', "You can't blacklist me.")], ...V2 });
            if (user.id === message.author.id) return message.channel.send({ components: [errorMsg('Denied', "You can't blacklist yourself.")], ...V2 });
            if (user.id === config.settings.owner) return message.channel.send({ components: [errorMsg('Denied', "You can't blacklist the owner.")], ...V2 });
            if (user.bot) return message.channel.send({ components: [errorMsg('Denied', "You can't blacklist a bot.")], ...V2 });
            
            let fetched = db.get(`blacklist_${user.id}`);
            if (!fetched) {
                db.set(`blacklist_${user.id}`, true);
                message.reply({ components: [successMsg('Blacklisted', `**${user.tag}** has been blacklisted.`)], ...V2 });
            } else {
                return message.reply({ components: [errorMsg('Already blacklisted', `**${user.tag}** is already blacklisted.`)], ...V2 });
            }
        }

        if (args[0] === "remove") {
            const user = message.mentions.users.first() || message.guild.members.cache.get(args[1]);
            if (!user) return message.channel.send({ components: [errorMsg('Missing User', 'You need to mention a valid user.')], ...V2 });
            if (user.id === client.user.id) return message.channel.send({ components: [errorMsg('Denied', "You can't blacklist me.")], ...V2 });
            if (user.id === message.author.id) return message.channel.send({ components: [errorMsg('Denied', "You can't blacklist yourself.")], ...V2 });
            if (user.id === config.settings.owner) return message.channel.send({ components: [errorMsg('Denied', "You can't blacklist the owner.")], ...V2 });
            if (user.bot) return message.channel.send({ components: [errorMsg('Denied', "You can't blacklist a bot.")], ...V2 });
            
            let fetched = db.get(`blacklist_${user.id}`);
            if (!fetched) {
                return message.reply({ components: [errorMsg('Not blacklisted', `**${user.tag}** is not blacklisted.`)], ...V2 });
            } else {
                db.delete(`blacklist_${user.id}`);
                message.reply({ components: [successMsg('Removed', `**${user.tag}** has been removed from the blacklist.`)], ...V2 });
            }
        }
    }
};
