const { findProxy, deleteProxy } = require(`../../nginxPM/index`)
const config = require('../../config.json')
module.exports = async (client, message, args) => {
    return message.reply('disabled')
    message.delete()
    if(!args[1]) return message.reply(`${error} What domain should i unproxy? command usage: \`${config.bot.prefix}unproxy <domain>\``)
    if(!domains.get(message.author.id)?.find(x => x.domain === args[1].toLowerCase())) return message.reply(`:x: I could not find this domain in ur domain list`)

    let msg = await message.channel.send(`unproxying . . .`)

    let proxytodelete = await findProxy(args[1].toLowerCase())
    if(!proxytodelete) return msg.edit(`${error} I Could not find your proxied domain.`)

    if(await deleteProxy(proxytodelete.id)){
        msg.edit(`${success} Domain unproxied!`)
        domains.set(message.author.id, domains.get(message.author.id)?.filter(x => x.domain !== args[1].toLowerCase()))
    }else{
        msg.edit(`${error} There was an error deleting the domain!`)
    }
}