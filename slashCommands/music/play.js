const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { convertTime } = require('../../handlers/convert');

module.exports = {
    name: "play",
    category: "music",
    description: "Play music from YouTube or other sources",
    options: [
        {
            name: "query",
            description: "The song name or URL to play",
            type: 3, // STRING
            required: true,
        }
    ],
    ownerOnly: false,
    run: async (client, interaction) => {
        if (!interaction.guild.members.me.permissions.has([
            PermissionsBitField.Flags.Connect,
            PermissionsBitField.Flags.Speak
        ])) {
            return interaction.reply('I do not have the permissions to connect to voice channels.');
        }

        const { channel } = interaction.member.voice;
        if (!channel) return interaction.reply('You need to be in a voice channel to play music.');

        const search = interaction.options.getString('query');

        try {
            const player = client.manager.create({
                guild: interaction.guild.id,
                voiceChannel: channel.id,
                textChannel: interaction.channel.id,
                selfDeafen: true,
                volume: 80,
            });

            if (player.state !== 'CONNECTED') await player.connect();

            let res;
            try {
                res = await player.search(search, interaction.user);
                if (!player)
                    return interaction.reply({ embeds: [new EmbedBuilder()
                        .setColor(client.embedColor)
                        .setTimestamp()
                        .setDescription('Nothing is playing right now...')] });

                if (res.loadType === 'LOAD_FAILED') {
                    if (!player.queue.current) player.destroy();
                    throw res.exception;
                }
            } catch (err) {
                return interaction.reply(`There was an error while searching: ${err.message}`);
            }

            switch (res.loadType) {
                case 'NO_MATCHES': {
                    if (!player.queue.current) player.destroy();
                    return interaction.reply({ embeds: [new EmbedBuilder()
                        .setColor(client.embedColor)
                        .setTimestamp()
                        .setDescription(`No matches found for - ${search}`)] });
                }

                case 'TRACK_LOADED': {
                    const track = res.tracks[0];
                    player.queue.add(track);
                    if (!player.playing && !player.paused && !player.queue.size) {
                        player.play();
                        return interaction.reply({ embeds: [new EmbedBuilder()
                            .setColor(client.embedColor)
                            .setTimestamp()
                            .setThumbnail(track.displayThumbnail('hqdefault'))
                            .setDescription(`🎵 **Now Playing**\n[${track.title}](${track.uri}) - \`[${convertTime(track.duration)}]\``)] });
                    }
                    const embed = new EmbedBuilder()
                        .setColor(client.embedColor)
                        .setTimestamp()
                        .setThumbnail(track.displayThumbnail('hqdefault'))
                        .setDescription(`➕ **Added song to queue**\n[${track.title}](${track.uri}) - \`[${convertTime(track.duration)}]\``);
                    return interaction.reply({ embeds: [embed] });
                }

                case 'PLAYLIST_LOADED': {
                    player.queue.add(res.tracks);
                    if (!player.playing && !player.paused && player.queue.totalSize === res.tracks.length) player.play();
                    const embed = new EmbedBuilder()
                        .setColor(client.embedColor)
                        .setTimestamp()
                        .setDescription(`📋 **Added playlist to queue**\n${res.tracks.length} Songs [${res.playlist.name}](${search}) - \`[${convertTime(res.playlist.duration)}]\``);
                    return interaction.reply({ embeds: [embed] });
                }

                case 'SEARCH_RESULT': {
                    const track = res.tracks[0];
                    player.queue.add(track);
                    if (!player.playing && !player.paused && !player.queue.size) {
                        player.play();
                        return interaction.reply({ embeds: [new EmbedBuilder()
                            .setColor(client.embedColor)
                            .setTimestamp()
                            .setThumbnail(track.displayThumbnail('hqdefault'))
                            .setDescription(`🎵 **Now Playing**\n[${track.title}](${track.uri}) - \`[${convertTime(track.duration)}]\` [<@${track.requester.id}>]`)] });
                    }
                    const embed = new EmbedBuilder()
                        .setColor(client.embedColor)
                        .setTimestamp()
                        .setThumbnail(track.displayThumbnail('hqdefault'))
                        .setDescription(`➕ **Added song to queue**\n[${track.title}](${track.uri}) - \`[${convertTime(track.duration)}]\` [<@${track.requester.id}>]`);
                    return interaction.reply({ embeds: [embed] });
                }
            }
        } catch (error) {
            console.error('Music play error:', error);
            return interaction.reply('❌ An error occurred while trying to play music. Please make sure the music system is properly configured.');
        }
    }
};