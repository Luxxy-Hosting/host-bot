const { MediaGalleryBuilder, MessageFlags } = require("discord.js");
const { NekoBot } = require("nekobot-api");
const api = new NekoBot();
const { V2, errorMsg } = require("../../helpers/components");

module.exports = {
    name: "gif",
    category: "Owner",
    description: "nah",
    aliases: ['pgif'],
    run: async (client, message, args) => {
        if (message.channel.nsfw === true) {
            try {
                const nsfw = await api.get("pgif");
                const gallery = new MediaGalleryBuilder().addItems(item => item.setURL(nsfw).setDescription('PGIF'));
                message.reply({ components: [gallery], ...V2 }).catch(err => message.reply({ components: [errorMsg('Error', 'Failed to send GIF.')], ...V2 }));
            } catch (err) {
                message.reply({ components: [errorMsg('API Error', 'Failed to fetch GIF.')], ...V2 });
            }
        } else {
            return message.reply({ components: [errorMsg('NSFW Only', 'This command can only be used in NSFW channels.')], ...V2 });
        }
    }
};