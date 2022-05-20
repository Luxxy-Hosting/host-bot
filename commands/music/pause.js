const { MessageEmbed } = require("discord.js");

module.exports = async (client, message, args) => {
    	const player = message.client.manager.get(message.guild.id);

        if (!player.queue.current) {
            let thing = new MessageEmbed()
                .setColor("RED")
                .setDescription("There is no music playing.");
            return message.channel.send({embeds: [thing]});
        }

        if (player.paused) {
            let thing = new MessageEmbed()
                .setColor("RED")
                .setDescription(`The player is already paused.`)
                .setTimestamp()
                return message.channel.send({embeds: [thing]});
        }

        player.pause(true);

        const song = player.queue.current;

        let thing = new MessageEmbed()
            .setColor(client.embedcolor)
            .setTimestamp()
            .setDescription(`**Paused**\n[${song.title}](${song.uri})`)
          return message.channel.send({embeds: [thing]});
	
}