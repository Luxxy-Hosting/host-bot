const { MessageFlags } = require('discord.js');
const { infoMsg, V2 } = require('../../helpers/components');

module.exports = (client, message, args) => {
    const container = infoMsg('Server Commands',
        `\`!server count\` — Shows how many server slots you have\n` +
        `\`!server create\` — Create a server\n` +
        `\`!server delete\` — Delete a server\n` +
        `\`!server list\` — Shows all your servers\n` +
        `\`!server status\` — Interact with your server\n` +
        `\`!server proxy\` — Proxy your server to a domain\n` +
        `\`!server unproxy\` — Delete a proxy\n` +
        `\`!server renew\` — Renew your expired server`
    );
    message.channel.send({ components: [container], ...V2 });
};