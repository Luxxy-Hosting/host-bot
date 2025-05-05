const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { convertTime } = require('../../handlers/convert');

module.exports = async (client, message, args) => {
    if (!message.guild.members.me.permissions.has([
        PermissionsBitField.Flags.Connect,
        PermissionsBitField.Flags.Speak
    ])) {
        return message.reply('I do not have the permissions to connect to voice channels.');
    }

    const { channel } = message.member.voice;
    if (!channel) return message.reply('You need to be in a voice channel to play music.');

    const player = client.manager.create({
        guild: message.guild.id,
        voiceChannel: channel.id,
        textChannel: message.channel.id,
        selfDeafen: true,
        volume: 80,
    });

    if (player.state !== 'CONNECTED') await player.connect();

    const search = args.join(' ');
    let res;
    try {
        res = await player.search(search, message.author);
        if (!player)
            return message.channel.send({ embeds: [new EmbedBuilder()
                .setColor(client.embedColor)
                .setTimestamp()
                .setDescription('Nothing is playing right now...')] });

        if (res.loadType === 'LOAD_FAILED') {
            if (!player.queue.current) player.destroy();
            throw res.exception;
        }
    } catch (err) {
        return message.reply(`There was an error while searching: ${err.message}`);
    }

    switch (res.loadType) {
        case 'NO_MATCHES': {
            if (!player.queue.current) player.destroy();
            return message.channel.send({ embeds: [new EmbedBuilder()
                .setColor(client.embedColor)
                .setTimestamp()
                .setDescription(`No matches found for - ${search}`)] });
        }

        case 'TRACK_LOADED': {
            const track = res.tracks[0];
            player.queue.add(track);
            if (!player.playing && !player.paused && !player.queue.size) {
                return player.play();
            }
            const embed = new EmbedBuilder()
                .setColor(client.embedColor)
                .setTimestamp()
                .setThumbnail(track.displayThumbnail('hqdefault'))
                .setDescription(`${global.emojiaddsong || ''} **Added song to queue**\n[${track.title}](${track.uri}) - \`[${convertTime(track.duration)}]\``);
            return message.channel.send({ embeds: [embed] });
        }

        case 'PLAYLIST_LOADED': {
            player.queue.add(res.tracks);
            if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
            const embed = new EmbedBuilder()
                .setColor(client.embedColor)
                .setTimestamp()
                .setDescription(`**Added playlist to queue**\n${res.tracks.length} Songs [${res.playlist.name}](${search}) - \`[${convertTime(res.playlist.duration)}]\``);
            return message.channel.send({ embeds: [embed] });
        }

        case 'SEARCH_RESULT': {
            const track = res.tracks[0];
            player.queue.add(track);
            if (!player.playing && !player.paused && !player.queue.size) {
                return player.play();
            }
            const embed = new EmbedBuilder()
                .setColor(client.embedColor)
                .setTimestamp()
                .setThumbnail(track.displayThumbnail('hqdefault'))
                .setDescription(`**Added song to queue**\n[${track.title}](${track.uri}) - \`[${convertTime(track.duration)}]\` [<@${track.requester.id}>]`);
            return message.channel.send({ embeds: [embed] });
        }
    }
};
