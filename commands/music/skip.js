const { MessageEmbed } = require("discord.js");

module.exports = async (client, message, args) => {
    const player = message.client.manager.get(message.guild.id);

        if (!player.queue.current) {
            let thing = new MessageEmbed()
                .setColor("RED")
                .setDescription("There is no music playing.");
            return message.channel.send({embeds: [thing]});
        }

        const autoplay = player.get("autoplay");
        const song = player.queue.current;

        if (autoplay === false) {
            player.stop();
        } else {
            player.stop();
            player.queue.clear();
            player.set("autoplay", false);
        }

		let thing = new MessageEmbed()
			.setDescription(`**Skipped**\n[${song.title}](${song.uri})`)
			.setColor(client.embedcolor)
			.setTimestamp()
		return message.channel.send({embeds: [thing]})
}