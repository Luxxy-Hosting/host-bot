//const config = require('../config.json')
/*
module.exports = async (client, member, guild) => {
    console.log('1')
    if (member.user.bot === true) {
        console.log('2')
        const role = client.guilds.cache.get(config.settings.guildID).roles.cache.find(role => role.name === 'Bots Hosted On Luxxy Hosting');
        member.roles.add(role.id).then(i => {
            const channel = client.channels.cache.get('941026456446828572');
            if (channel) {
                channel.send(`<@!${member.user.id}> has joined the server. \n > Added role ${role.name}`);
            }
        })
        
    }
} /*/

module.exports = async (client, member, guild) => {}