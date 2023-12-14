const delay = require("delay");
const { EmbedBuilder } = require("discord.js");
const ms = require('ms');

module.exports = async (client, player) => {

	const channel = client.channels.cache.get(player.textChannel);
	const emojiwarn = '⚠';
	let thing = new EmbedBuilder()
		.setDescription(`${emojiwarn} **Music queue ended**`)
		.setFooter({text: client.user.username, iconURL: client.user.displayAvatarURL()});
	channel.send({embeds: [thing] });
}