const config = require('../../config.json')
const Discord = require('discord.js')
const pretty = require('prettysize');
const axios = require('axios')
const stringTable = require('string-table')
const ms = require('ms')
module.exports = {
    name: "analysenode2",
    aliases: [''], 
    async run(client, message, args){
        if(!message.member.roles.cache.has(config.roleID.administrator)) return message.channel.send('You do not have the required permissions to use this command.')
        if(!args[0]) return message.channel.send(`you stupid... chose a number: !analyse <ammount to show> <obtional: ram/cpu/disk> `)
        let sortby

        if(args[1]) {
            sortby = args[1].toLowerCase() === 'cpu' ? "CPU" : args[1].toLowerCase() === "ram" ? "RAM" : args[1].toLowerCase() === "disk" ? "DISK" : null
        }

        let msg
        let start = Date.now()
        await axios({
            url: config.pterodactyl.host+"/api/admin/nodes/19bd6297-0400-473d-ac4d-1ea8004156f6/servers",
            method: 'GET',
            followRedirect: true,
            maxRedirects: 5,
            headers: {
                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            params: { per_page: 500 }
        }).then(async ({data}) => {

            const servers = data?.servers?.data || [];
            msg = await message.reply('Calculating '+servers.length+' servers. . .')

            let done = (await Promise.all(servers.map(async server => {

                let id = server.uuid_short
                let name = server.name

                try{
                    let {data: {resources}} = await axios({
                        url: config.pterodactyl.host + '/api/client/servers/' + id + "/resources",
                        method: 'GET',
                        followRedirect: true,
                        maxRedirects: 5,
                        headers: {
                            'Authorization': 'Bearer ' + config.pterodactyl.clientAPI,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        }
                    })
                    return {Name: name, ID: id, CPU: resources.cpu_absolute + "%",  RAM: pretty(resources.memory_bytes), Disk: pretty(resources.disk_bytes), resources}
                }catch(err){return {Name: 0, ID: 0, CPU: 0,  RAM: 0, Disk: 0, resources: {memory_bytes: "0"}}}
            }))).sort(function(a, b) {
                return sortby === 'CPU' ? b?.resources?.cpu_absolute - a?.resources?.cpu_absolute : sortby === 'DISK' ? b?.resources?.disk_bytes - a?.resources?.disk_bytes : b?.resources?.memory_bytes - a?.resources?.memory_bytes 
            }).slice(0, args[0])

            msg.edit(`\`\`\`\n${stringTable.create(done)}\`\`\`\ntime taken: ${ms(Date.now() - start)}`).catch(err => {message.reply(`:x: Too Long Message!`)})

        }).catch(x => {msg ? msg.edit(`${x}.`) : message.reply(`${x}.`)})
    }
}