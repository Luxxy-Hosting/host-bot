const { MessageFlags } = require('discord.js');
const { infoMsg, V2 } = require('../../helpers/components');
const config = require('../../config.json');

module.exports = (client, message, args) => {
    const p = config.bot.prefix;
    const container = infoMsg('User Commands',
        `\`${p}user new\` — Create an account\n` +
        `\`${p}user delete\` — Unlink your account\n` +
        `\`${p}user link\` — Shows info about your account\n` +
        `\`${p}user password\` — Reset your password`
    );
    message.channel.send({ components: [container], ...V2 });
};