const config = require('../config.json')
const { Manager } = require("erela.js");
const { readdirSync } = require("fs");

module.exports = async (client) => {
    const nodes = [
      {
        host: config.lavalink.host,
        password: config.lavalink.password,
        port: config.lavalink.port,
        secure: config.lavalink.secure,
      }
    ]
    
    client.manager = new Manager({
      autoPlay: true,
      nodes: nodes,
      plugins: [],
      send(id, payload) {
        const guild = client.guilds.cache.get(id);
        if (guild) guild.shard.send(payload);
      },
    })

    readdirSync(`${dir}/handlers/Lavalink/`).forEach(file => {
        const event = require(`${dir}/handlers/Lavalink/${file}`);
        let eventName = file.split(".")[0];
        console.log(`Loading Events Lavalink ${eventName}`);
        client.manager.on(eventName, event.bind(null, client));
    });
}