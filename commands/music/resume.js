const { EmbedBuilder, Colors } = require("discord.js");

module.exports = async (client, message, args) => {

    const player = message.client.manager.get(message.guild.id);
    const song = player.queue.current;

        if (!player.queue.current) {
            let thing = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription("There is no music playing.");
            return message.channel.send({embeds: [thing]});
        }
        
        if (!player.paused) {
            let thing = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription(`The player is already **resumed**.`)
                .setTimestamp()
          return message.channel.send({embeds: [thing]});
        }

        player.pause(false);

        let thing = new EmbedBuilder()
            .setDescription(`**Resumed**\n[${song.title}](${song.uri})`)
            .setColor(client.embedcolor)
            .setTimestamp()
        return message.channel.send({embeds: [thing]});

}