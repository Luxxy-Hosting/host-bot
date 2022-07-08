const Discord = require('discord.js');
const config = require('../config.json');
module.exports = (client, message) => {
    const webhook = new Discord.WebhookClient({ id: config.settings.webhook.id, token: config.settings.webhook.token});

    // const deleteembed = new Discord.MessageEmbed()
    //     .setColor('#ff0000')
    //     .setTitle('Message Deleted')
    //     .setDescription(`${message.author.username} deleted a message in ${message.channel.name}`)
    //     .addField('Message', `${message.content}`)
    //     .setTimestamp()
    //     .setFooter(`ID: ${message.id}`);
    // webhook.send({ embeds: [deleteembed] });

    let data = {
        message: message.content,
        member: message.member,
        timestamp: Date.now(),
        action: "delete",
        image: message.attachments.first() ? message.attachments.first().proxyURL : null
    };

    if (client.snipes.get(message.channel.id) == null) client.snipes.set(message.channel.id, [data])
    else client.snipes.set(message.channel.id, [...client.snipes.get(message.channel.id), data]);

    client.snipes.set(message.channel.id, client.snipes.get(message.channel.id).filter(x => (Date.now() - x.timestamp) < 300000 && x != null));

}