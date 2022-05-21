const config = require('../config.json')
const { Manager } = require("erela.js");
const { readdirSync } = require("fs");

module.exports = async (client) => {
  client.manager = new Manager({
    nodes: config.lavalink.nodes,
    send: (id, payload) => {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
    },
    autoPlay: true,
    plugins: [],
   });

   client.on("raw", (d) => client.manager.updateVoiceState(d));
   readdirSync("./events/Lavalink/").forEach(file => {
    const event = require(`../events/Lavalink/${file}`);
    let eventName = file.split(".")[0];
    client.manager.on(eventName, event.bind(null, client));
});
}