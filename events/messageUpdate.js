const config = require('../config.json')
const Discord = require('discord.js')
module.exports = (client, oldMessage, newMessage) => {

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
    
    if(config.settings.messageLog){
        const embed = new Discord.MessageEmbed()
        embed.setTitle('✏️ Edited Message')
        embed.setColor(`BLUE`)
        oldMessage.content ? embed.addField(`Message Content`, oldMessage.content.includes('```') ? `${oldMessage.content}` : `\`\`\`\n${oldMessage.content}\`\`\``) : null
        oldMessage.attachments?.size !== 0 ? embed.setImage(oldMessage.attachments?.first()?.proxyURL) : null
        oldMessage.attachments?.size !== 0 ? content = oldMessage.attachments?.map(x => x?.proxyURL).join("\n") : content = null
        embed.setFooter({ text: `${oldMessage.member.user.tag} (${oldMessage.member.user.id}) \nin #${oldMessage.channel.name}`, iconURL: oldMessage?.member?.user?.displayAvatarURL()});
        embed.setTimestamp()
        
        
        client.channels.cache.get(config.channelID.messageLog).send({content: content, embeds: [embed]}).catch(err => {})
    }
}
