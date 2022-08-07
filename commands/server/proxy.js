const Discord = require('discord.js');
const config = require('../../config.json')
const axios = require('axios')
const { getDomainIP, proxyDomain, findProxy, deleteProxy } = require(`../../nginxPM/index`)
module.exports = async (client, message, args) => {
    let port
    let localdomain
    let serverid = args[1]
    let domain = args[2]
    
    if(
        !serverid ||
        !serverid?.split('-')[0] ||
        !domain ||
        domain.split('.').length === 1
    ) return message.channel.send(`:x: Incorrect command usage. Please run: \`${config.bot.prefix}server proxy <server id> <your_domain.com>\``)
    const userdata = require('../../models/userData')
    const userdb = await userdata.findOne({ ID: message.author.id })
    let preoutput = (await axios({
        url: config.pterodactyl.host + "/api/application/users/" + userdb.consoleID + "?include=servers",
        method: 'GET',
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'Application/vnd.pterodactyl.v1+json',
        }
    }).catch(err => {})).data.attributes.relationships.servers.data

    if(!preoutput) return message.channel.send(`:x: There was an error connecting to the panel`)

    const isurserver = await preoutput.find(srv => srv.attributes ? srv.attributes.identifier == args[1] : false)
    if(!isurserver) return message.reply(`:x: I could not find that server`)

    let serverdata = (await axios({
        url: config.pterodactyl.host + "/api/client/servers/" + serverid,
        method: 'GET',
        followRedirect: true,
        maxRedirects: 5,
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
            'Content-Type': 'application/json',
            'Accept': 'Application/vnd.pterodactyl.v1+json',
        }
    }).catch(err => {}))?.data.attributes
    if(!serverdata) return message.channel.send(`:x: There was an error connecting to the panel`)

    localdomain = serverdata.sftp_details.ip

    if(serverdata.relationships.allocations.data.length !== 1){
        let i = 1
        message.reply({
            embeds:[
                new Discord.EmbedBuilder()
                .addField(`Apparently you have more than one port`, `The ports you have are:\n\`\`\`\n${serverdata.relationships.allocations.data.map(x => i++ +". "+ x.attributes.port).join('\n')}\`\`\`\nPlease send a new message with the port you want to proxy`)
                .setColor(Discord.Colors.Orange)
            ]
        })
        const filter = m => m.author.id === message.author.id
        let collected = await message.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] }).catch(err => {return message.reply(`Time had expired . . .`)})
        if(isNaN(collected?.first()?.content)) return message.reply(`:x: The Message you sent is not a number`)
        let postchosen = parseInt(collected.first().content)
        if(!serverdata.relationships.allocations.data.map(x => x.attributes.port).includes(postchosen)) return message.reply(`:x: The port selected isnt in the list.`)

        port = postchosen
    }else{
        port = serverdata.relationships.allocations.data[0].attributes.port
    }

    let msg = await message.channel.send(`Proxying . . .`)

    domainIP = await getDomainIP(domain)
    if(!domainIP || domainIP !== '138.68.159.181') return msg.edit(`The domain you gave doesnt have the right ip address. the ip should be: \`138.68.159.181\` *with cloudflare proxy turned off*`)

    msg.edit(`Creating LetsEncrypt certificate, this might take some time.`)
    let proxyinfo = await proxyDomain(domain, localdomain, port)

    if(!proxyinfo.error){
        msg.edit(`${success} Your domain had been proxied. Proxy id: ${proxyinfo.data.id}`)

        let userDomains = domains.get(message.author.id) || []

        domains.set(message.author.id, [...new Set(userDomains), {
            domain: domain.toLowerCase(),
            serverID: serverid,
        }]);

    }else{
        if(proxyinfo.message === 'Request failed with status code 500'){
            let proxytodelete = await findProxy(domain)
            if(!proxytodelete)return msg.edit(`There was an error proxying your domain. I could not get the ssl certificate. This error could happend if you proxyed this domain more than 5 times in a week`)
            
            if(await deleteProxy(proxytodelete.id)){
                msg.edit(`There was an error proxying your domain. I could not get the ssl certificate. This error could happend if you proxyed this domain more than 5 times in a week. Just to know, i deleted your proxy sience it doesnt work`)
            }else{
                msg.edit(`There was an error proxying your domain. I could not create a ssl certificate and i could not delete the proxy after the error *id was not found*`)
            }

        }else if (proxyinfo.message === 'Request failed with status code 400'){
            msg.edit(`There was an error proxying your domain. I think someone already proxied this domain`)
        } else {
            msg.edit(`There was an error proxying your domain. Error: ${proxyinfo.message}`)
        }
    }
}
