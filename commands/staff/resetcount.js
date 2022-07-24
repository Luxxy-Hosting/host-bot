const Discord = require("discord.js");

module.exports = {
    name: "resetcount",
    description: "Reset the count of a server",
    run: async (client, message, args) => {
            const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);

            if (!user) {
                return message.channel.send("Please mention a user or provide a user ID. <a:whatisthis:951132055134162954>");
            }

            const count = serverCount.get(user.id);

            if (!count) {
                return message.channel.send("This user has never been counted. <a:whatisthis:951132055134162954>");
            }

            const number = args[1]

            if (!number) {
                return message.channel.send("Please provide a number. <a:whatisthis:951132055134162954>");
            }

            const msg = await message.channel.send({ content: `Are you sure you want to reset ${user.tag}'s count to ${number}? <a:whatisthis:951132055134162954>`, components: [ 
                new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('AcceptDelete')
                        .setLabel('Yes')
                        .setStyle('SUCCESS'),
                )
                .addComponents(
                    new Discord.MessageButton()
                        .setCustomId('RejectDelete')
                        .setLabel('No')
                        .setStyle('DANGER'),
                )
            ]});
            
            const filter = i => i.user.id === message.author.id;
            const Collector = msg.createMessageComponentCollector({ filter, time: 300000 });
            
            Collector.on('collect', async i => {
                i.deferUpdate()
                Collector.stop()
                if(i.customId === "AcceptDelete") {
                    msg.edit({
                        content: `Resetting ${user.tag}'s count to ${number}... <a:whatisthis:951132055134162954>`,
                    })
                    serverCount.set(user.id, {
                        have: 3,
                        used: number
                    })
                    msg.edit(`${success} ${user.tag} Count reset!`)
                }
                if(i.customId === "RejectDelete") {
                    msg.edit({
                        content: `${success} Count reset canceled <a:whatisthis:951132055134162954>`,
                    })
                }
            })
            Collector.on('end',() => {
                msg.edit({components:[]})
            })
    }
}