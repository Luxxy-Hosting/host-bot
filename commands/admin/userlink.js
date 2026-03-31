const userData = require('../../models/userData');
const moment = require('moment');
const axios = require('axios')
const config = require('../../config.json')

module.exports = {
    name: "userlink",
    category: "Owner",
    description: "Links User to Account",
    run: async (client, message, args) => {
        if (message.author.id === config.settings.owner) {

            const discorduser = await message.mentions.users.first();
            const consoleid = args[1]
            if (!args[1]) {
                return message.reply('Please put a console id <:what2:965935677416013824>')
            }

            axios({
                url: `${config.pterodactyl.host}/api/admin/users/${consoleid}`,
                method: 'GET',
                followRedirect: true,
                maxRedirects: 5,
                headers: {
                    'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }).then(async res => {
                const user = res.data.user || res.data;
                userData({
                    ID: discorduser.id,
                    consoleID: user.uuid || consoleid,
                    email: user.email,
                    username: user.username,
                    linkTime: moment().format("HH:mm:ss"),
                    linkDate: moment().format("YYYY-MM-DD"),
                }).save().catch(e => message.reply('no'))
                
                message.reply(`🍑 i have linked <@!${discorduser.id}> to the account **${user.username}**`)
            }).catch(e => message.reply(`Error: ${e}`))
            
        }
    }
}