const { EmbedBuilder, Colors } = require("discord.js");
const { convertTime } = require('../../handlers/convert');
const { progressbar } = require('../../handlers/progressbar.js')

module.exports = async (client, message, args) => {
  
        const player = message.client.manager.get(message.guild.id);

        if (!player.queue.current) {
            let thing = new EmbedBuilder()
                .setColor(Colors.Red)
                .setDescription("There is no music playing.");
            return message.channel.send({ embeds: [thing] });
        }

        const song = player.queue.current

        // Progress Bar
        var total = song.duration;
        var current = player.position;
        var size = 20;
        var line = '▬';
        var slider = '🔘';

        let embed = new EmbedBuilder()
            .setDescription(`**Now Playing**\n[${song.title}](${song.uri}) - \`[${convertTime(song.duration)}]\` [<@${song.requester.id}>]`)
            .setThumbnail(song.displayThumbnail("3"))
            .setColor(client.embedcolor)
            .addFields({ name: "\u200b", value: progressbar(total, current, size, line, slider)})
            .addFields({ name: "\u200b", value: `\`${convertTime(current)} / ${convertTime(total)}\``})
         return message.channel.send({embeds: [embed]})
            
}