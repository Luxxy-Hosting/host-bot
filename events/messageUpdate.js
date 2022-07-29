const Discord = require('discord.js');
const config = require('../config.json');

module.exports = (client, oldMessage, newMessage) => {

    // const webhook = new Discord.WebhookClient({ id: config.settings.webhook.id, token: config.settings.webhook.token});
    // const embed = new Discord.MessageEmbed()
    //     .setColor('#ff0000')
    //     .setTitle('Message Updated')
    //     .addField('Old Message', `${oldMessage.content}` || 'No Message')
    //     .addField('New Message', `${newMessage.content}`)
    //     .setTimestamp()
    //     .setFooter(`ID: ${oldMessage.id}`);
    // webhook.send({ embeds: [embed] });

    if (oldMessage.author == null || oldMessage.author.bot == true || !oldMessage.content || newMessage == null) return;

    let data = {
        message: oldMessage.content,
        member: oldMessage.member,
        timestamp: Date.now(),
        action: "edit"
    };

    if (client.snipes.get(oldMessage.channel.id) == null) client.snipes.set(oldMessage.channel.id, [data])
    else client.snipes.set(oldMessage.channel.id, [...client.snipes.get(oldMessage.channel.id), data]);

    client.snipes.set(oldMessage.channel.id, client.snipes.get(oldMessage.channel.id).filter(x => (Date.now() - x.timestamp) < 300000 && x != null));

}