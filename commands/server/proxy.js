const { ContainerBuilder, MessageFlags } = require('discord.js');
const config = require('../../config.json');
const axios = require('axios');
const { getDomainIP, proxyDomain, findProxy, deleteProxy } = require(`../../nginxPM/index`);
const { C, V2, errorMsg, warnMsg, successMsg, infoMsg } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    return message.reply({ components: [errorMsg('Deprecated', `This command is deprecated. Please use \`${config.bot.prefix}server domain\` instead.`)], ...V2 });
    
    let port;
    let localdomain;
    let serverid = args[1];
    let domain = args[2];
    
    if (
        !serverid ||
        !serverid?.split('-')[0] ||
        !domain ||
        domain.split('.').length === 1
    ) return message.channel.send({ components: [errorMsg('Usage', `Incorrect usage. \`${config.bot.prefix}server proxy <server id> <your_domain.com>\``)], ...V2 });
    
    const userdata = require('../../models/userData');
    const userdb = await userdata.findOne({ ID: message.author.id });
    
    let preoutput;
    try {
        const res = await axios({
            url: config.pterodactyl.host + "/api/admin/users/" + userdb.consoleID + "/servers?per_page=100",
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        preoutput = res.data?.servers?.data || [];
    } catch(err) {}

    if (!preoutput) return message.channel.send({ components: [errorMsg('Connection Error', `There was an error connecting to the panel.`)], ...V2 });

    const isurserver = preoutput.find(srv => srv.uuid_short == args[1]);
    if (!isurserver) return message.reply({ components: [errorMsg('Not Found', `I could not find that server.`)], ...V2 });

    let serverdata;
    try {
        const res = await axios({
            url: config.pterodactyl.host + "/api/client/servers/" + serverid,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        serverdata = res.data?.server;
    } catch(err) {}
    
    if (!serverdata) return message.channel.send({ components: [errorMsg('Connection Error', `There was an error connecting to the panel.`)], ...V2 });

    localdomain = serverdata.sftp_details.ip;

    if (serverdata.relationships.allocations.data.length !== 1) {
        let i = 1;
        const portContainer = new ContainerBuilder()
            .setAccentColor(C.Warning)
            .addTextDisplayComponents(td => td.setContent(`## ⚠️ Multiple Ports Found`))
            .addSeparatorComponents(sep => sep.setDivider(true))
            .addTextDisplayComponents(td => td.setContent(
                `The ports you have are:\n` +
                `\`\`\`\n${serverdata.relationships.allocations.data.map(x => `${i++}. ${x.port}`).join('\n')}\n\`\`\`\n` +
                `Please send a new message with the port you want to proxy.`
            ));

        message.reply({ components: [portContainer], ...V2 });
        
        const filter = m => m.author.id === message.author.id;
        let collected = await message.channel.awaitMessages({ filter, max: 1, time: 10000, errors: ['time'] }).catch(err => {
            return message.reply({ components: [warnMsg('Timeout', 'Time has expired.')], ...V2 });
        });
        if (!collected) return;
        
        if (isNaN(collected?.first()?.content)) return message.reply({ components: [errorMsg('Invalid Input', `The message you sent is not a number.`)], ...V2 });
        let postchosen = parseInt(collected.first().content);
        if (!serverdata.relationships.allocations.data.map(x => x.port).includes(postchosen)) {
            return message.reply({ components: [errorMsg('Not Found', `The port selected isn't in the list.`)], ...V2 });
        }

        port = postchosen;
    } else {
        port = serverdata.relationships.allocations.data[0].port;
    }

    let msg = await message.channel.send({ components: [infoMsg('Proxy', `Proxying...`)], ...V2 });

    domainIP = await getDomainIP(domain);
    if (!domainIP || domainIP !== '23.26.226.86') {
        return msg.edit({ components: [errorMsg('Invalid IP', `The domain doesn't have the right IP. It should be \`23.26.226.86\` with Cloudflare proxy turned off.`)], ...V2 });
    }

    msg.edit({ components: [infoMsg('SSL Certificate', `Creating Let's Encrypt certificate, this might take some time...`)], ...V2 });
    let proxyinfo = await proxyDomain(domain, localdomain, port);

    if (!proxyinfo.error) {
        msg.edit({ components: [successMsg('Proxied', `Your domain has been proxied.\nProxy ID: \`${proxyinfo.data.id}\``)], ...V2 });

        let userDomains = domains.get(message.author.id) || [];
        domains.set(message.author.id, [...new Set(userDomains), {
            domain: domain.toLowerCase(),
            serverID: serverid,
        }]);
    } else {
        if (proxyinfo.message === 'Request failed with status code 500') {
            let proxytodelete = await findProxy(domain);
            if (!proxytodelete) return msg.edit({ components: [errorMsg('SSL Error', `Error getting SSL certificate. May happen if proxied >5 times/week.`)], ...V2 });
            
            if (await deleteProxy(proxytodelete.id)) {
                msg.edit({ components: [errorMsg('SSL Error', `Error getting SSL certificate. Deleted non-working proxy.`)], ...V2 });
            } else {
                msg.edit({ components: [errorMsg('SSL Error', `Error creating SSL and could not automatically remove proxy.`)], ...V2 });
            }

        } else if (proxyinfo.message === 'Request failed with status code 400') {
            msg.edit({ components: [errorMsg('Duplicate', `Someone may have already proxied this domain.`)], ...V2 });
        } else {
            msg.edit({ components: [errorMsg('Error', `Error proxying domain: ${proxyinfo.message}`)], ...V2 });
        }
    }
};
