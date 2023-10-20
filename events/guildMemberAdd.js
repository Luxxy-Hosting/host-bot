const config = require('../config.json')
module.exports = async (client, member, guild) => {
    console.log('1')
    if (member.user.bot === false) {
        console.log('2')
        const role = client.guilds.cache.get(config.settings.guildID).roles.cache.find(role => role.name === 'Verified Member');
        member.roles.add(role.id).then(i => {
            const channel = client.channels.cache.get('1028046733780983848');
            if (channel) {
                channel.send(`<@!${member.user.id}> has joined the server. \n > Added role ${role.name}`);
            }
        })
        
    }
}