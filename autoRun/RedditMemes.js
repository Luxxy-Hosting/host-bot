const { EmbedBuilder, Colors } = require('discord.js');
const axios = require('axios');
const chalk = require('chalk');
const config = require('../config.json');

const memeChannelId = config.channelID?.memes || '1364587658281484320';

const memeSubreddits = [
    'memes',
    'dankmemes',
    'funny',
    'wholesomememes',
    'HistoryMemes',
    'ProgrammerHumor',
    'AdviceAnimals',
    'MemeEconomy',
    'Animemes',
    'PrequelMemes'
];

const postIntervalMinutes = 5;
let lastMemeUrl = '';

async function fetchAndPostMeme(client, targetChannel) {
    if (!client || !targetChannel || !targetChannel.isTextBased()) {
        console.error(chalk.red('[Meme] Invalid client or channel object passed to fetchAndPostMeme.'));
        return;
    }
    console.log(chalk.blue(`[Meme] Attempting to fetch a new meme...`));

    let memeData = null;
    const shuffledSubreddits = [...memeSubreddits].sort(() => 0.5 - Math.random());

    for (const subreddit of shuffledSubreddits) {
        try {
            const url = `https://www.reddit.com/r/${subreddit}/hot.json?limit=100`;
            console.log(chalk.cyan(`[Meme] Trying subreddit: r/${subreddit}`));

            const response = await axios.get(url, { timeout: 8000 });
            const posts = response.data?.data?.children;

            if (!posts || posts.length === 0) {
                console.warn(chalk.yellow(`[Meme] No posts returned from r/${subreddit}.`));
                continue;
            }

            const validPosts = posts
                .map(post => post.data)
                .filter(post =>
                    post &&
                    !post.stickied &&
                    !post.over_18 &&
                    post.url &&
                    (post.post_hint === 'image' || /\.(jpg|jpeg|png|gif)$/i.test(post.url)) &&
                    post.url !== lastMemeUrl
                );

            if (validPosts.length > 0) {
                memeData = validPosts[Math.floor(Math.random() * validPosts.length)];
                lastMemeUrl = memeData.url;
                console.log(chalk.green(`[Meme] Found meme from r/${subreddit}: "${memeData.title}"`));
                break;
            } else {
                 console.warn(chalk.yellow(`[Meme] No suitable image posts found in r/${subreddit} this time.`));
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                 console.error(chalk.red(`[Meme] Axios error fetching from r/${subreddit}: ${error.response?.status || error.message}`));
            } else {
                console.error(chalk.red(`[Meme] Non-Axios error fetching from r/${subreddit}:`), error);
            }
        }
    }

    if (!memeData) {
        console.error(chalk.red('[Meme] Failed to fetch a suitable meme after trying multiple subreddits.'));
        return;
    }

    try {
        const embed = new EmbedBuilder()
            .setTitle(memeData.title.substring(0, 256))
            .setURL(`https://reddit.com${memeData.permalink}`)
            .setImage(memeData.url)
            .setColor(client.embedColor || config.embedColor || Colors.Orange)
            .setFooter({ text: `r/${memeData.subreddit} • Posted by u/${memeData.author} • 👍 ${memeData.ups}` });

        await targetChannel.send({ embeds: [embed] });
        console.log(chalk.green(`[Meme] Successfully posted meme to channel #${targetChannel.name} (${targetChannel.id}).`));
    } catch (error) {
        console.error(chalk.red(`[Meme] Failed to send meme embed to Discord channel ${targetChannel.id}:`), error);
    }
}

module.exports = async (client) => {
    if (!memeChannelId) {
        console.error(chalk.red('[Meme] Meme channel ID (config.channelID.memes) is not defined in config.json. Meme posting disabled.'));
        return;
    }

    console.log(chalk.blue('[Meme] Waiting a few seconds for client cache...'));
    await new Promise(resolve => setTimeout(resolve, 5000));

    const memeChannel = client.channels.cache.get(memeChannelId);

    if (memeChannel && memeChannel.isTextBased()) {
        console.log(chalk.blue(`[Meme] Initializing meme poster for channel #${memeChannel.name}. Interval: ${postIntervalMinutes} minutes.`));

        // await fetchAndPostMeme(client, memeChannel); // Optional immediate run

        setInterval(() => {
            fetchAndPostMeme(client, memeChannel);
        }, postIntervalMinutes * 60 * 1000);

    } else {
        console.error(chalk.red(`[Meme] Could not find meme channel with ID: ${memeChannelId} or it's not a text-based channel. Meme posting disabled.`));
    }
};
