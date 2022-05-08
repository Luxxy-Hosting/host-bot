const config = require('../config.json')

module.exports = async (client) => {
    const guild = client.guilds.cache.get(config.settings.guildID)

    guild.channels.cache.filter(c => c.parentId === config.parentID.createAccount ).forEach(async (channel) => {
        channel.delete({ reason: 'Auto-deleted' })
        console.log(`Deleted channel ${channel.name} (${channel.id})`)
    })
}