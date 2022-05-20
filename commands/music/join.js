const { MessageEmbed } = require("discord.js");

module.exports = async (client, message, args) => {
    const { channel } = message.member.voice;

        if(!message.guild.me.voice.channel) {
            
            const player = message.client.manager.create({
                guild: message.guild.id,
                voiceChannel: channel.id,
                textChannel: message.channel.id,
                volume: 50,
                selfDeafen: true,
            });

            player.connect();

            let thing = new MessageEmbed()
                .setColor(client.embedcolor)
                .setDescription(`**Join the voice channel**\nJoined <#${channel.id}> and bound to <#${message.channel.id}>`)
             return message.channel.send({embeds: [thing]});

        } else if (message.guild.me.voice.channel !== channel) {

            let thing = new MessageEmbed()
                .setColor("RED")
                .setDescription(`You must be in the same channel as ${message.client.user}`);
            return message.channel.send({embeds: [thing]});
        }
}