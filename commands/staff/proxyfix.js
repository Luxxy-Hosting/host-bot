const { findProxy, deleteProxy } = require(`../../nginxPM/index`)
module.exports = async (client, message, args) => {
    if (!message.member.roles.cache.has(config.roleID.support)) return message.reply('You do not have the required permissions to use this command.');
    if(!args[1]) return message.reply(`:x: What domain should i unproxy? command usage: \`!staff proxyfix <domain>\``)
    
    let data = domains.all().find(x=> JSON.parse(x.data).find(y => y.domain === args[1]))
    if(data){
        domains.set(data.ID, domains.get(data.ID)?.filter(x => x.domain !== args[1].toLowerCase()))
        message.reply(`Domain \`${args[1].toLowerCase()}\` deleted from someone's database`)
    }

    let proxytodelete = await findProxy(args[1].toLowerCase())
    if(proxytodelete){
        await deleteProxy(proxytodelete.id)
        message.reply(`Domain \`${args[1].toLowerCase()}\` deleted from Proxy Manages`)
    }
}