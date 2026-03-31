const { MediaGalleryBuilder, MessageFlags } = require("discord.js");
const axios = require('axios');
const { V2, errorMsg } = require("../../helpers/components");

module.exports = {
    name: "random",
    category: "Owner",
    description: "nah",
    aliases: ['r'],
    run: async (client, message, args) => {
        if (message.channel.nsfw === true) {
            axios.get('https://api.luxxy.host/api/random?key=fl-5s94ed').then(e => {
                const gallery = new MediaGalleryBuilder().addItems(item => item.setURL(e.data.image).setDescription('Random Image'));
                message.reply({ components: [gallery], ...V2 });
            }).catch(err => message.reply({ components: [errorMsg('API Error', 'Not working at this time.')], ...V2 }));
        } else {
            return message.reply({ components: [errorMsg('NSFW Only', 'This command can only be used in NSFW channels.')], ...V2 });
        }
    }
};