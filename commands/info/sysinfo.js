const Discord = require('discord.js')
const moment = require("moment");
require("moment-duration-format");
const os = require("os");
const si = require("systeminformation");

module.exports = {
    name: 'sysinfo',
    aliases: [''],

    async run(client, message, args) {
        const duration1 = moment
        .duration(message.client.uptime)
        .format(" D [days], H [hrs], m [mins], s [secs]");
      const cpu = await si.cpu();
      let ccount = client.channels.cache.size;
      let scount = client.guilds.cache.size;
      let mcount = 0;
      client.guilds.cache.forEach((guild) => {
        mcount += guild.memberCount;
      });
        const embed = new Discord.MessageEmbed()
        .setThumbnail(message.client.user.displayAvatarURL())
        .setDescription(`**Status**
  **= STATISTICS =**
  **• Servers** : ${scount}
  **• Channels** : ${ccount}
  **• Users** : ${mcount}
  **• Node** : ${process.version}
  **= SYSTEM =**
  **• Platfrom** : ${os.type}
  **• Uptime** : ${duration1}
  **• CPU** :
  > **• Cores** : ${cpu.cores}
  > **• Model** : ${os.cpus()[0].model} 
  > **• Speed** : ${os.cpus()[0].speed} MHz
  **• MEMORY** :
  > **• Total Memory** : ${(os.totalmem() / 1024 / 1024).toFixed(2)} Mbps
  > **• Free Memory** : ${(os.freemem() / 1024 / 1024).toFixed(2)} Mbps
  > **• Heap Total** : ${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(
        2
      )} Mbps
  > **• Heap Usage** : ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(
        2
      )} Mbps
  `);
  message.reply({ embeds: [embed] });
    }
}