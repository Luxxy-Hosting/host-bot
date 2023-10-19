const Discord = require("discord.js");
const util = require('util');
const userData = require('../../models/userData');
const moment = require('moment');
const { MessageFlagsBitField } = require("discord.js");

module.exports = {
    name: "userlink",
    category: "Owner",
    description: "eeeeeeeee",
    run: async (client, message, args) => {
        const discordid = args[0]
        const email = args[1]
        const consoleid = args[2]

        userData({
            ID: discordid,
            consoleID: consoleid,
            email: email,
            username: 'eeeeee',
            linkTime: moment().format("HH:mm:ss"),
            linkDate: moment().format("YYYY-MM-DD"),
        }).save().catch(e => message.reply('no'))

        message.reply('user linked')
    }
}