const config = require('../../config.json');
const { ContainerBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const axios = require('axios');
const userData = require('../../models/userData');
const serverData = require('../../models/serverData');
const { C, V2, errorMsg, successMsg, warnMsg, loadingMsg, textContainer } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id });
    if (!userDB) {
        return message.reply({ components: [errorMsg('No Account', `You don't have an account. Type \`${config.bot.prefix}user new\` to create one.`)], ...V2 });
    }
    if (!args[1]) return message.reply({ components: [errorMsg('Missing ID', `Provide a server ID: \`${config.bot.prefix}server delete <server id>\``)], ...V2 });
    if (args[1].match(/[0-9a-z]+/i) == null)
        return message.channel.send({ components: [errorMsg('Invalid', 'Only use alphanumeric characters.')], ...V2 });

    args[1] = args[1].split('-')[0];

    let msg = await message.channel.send({ components: [loadingMsg('Checking server ownership...')], ...V2 });
    axios({
        url: config.pterodactyl.host + "/api/admin/users/" + userDB.consoleID + "/servers?per_page=100",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }).then(async response => {
        const preoutput = response.data?.servers?.data || [];
        const output = await preoutput.find(srv => srv.uuid_short == args[1]);

        if (!output) return msg.edit({ components: [errorMsg('Not Found', 'Could not find that server.')], ...V2 });
        if (output.owner?.uuid !== userDB.consoleID) return msg.edit({ components: [errorMsg('Not Yours', 'You are not the owner of this server.')], ...V2 });

        const confirmContainer = new ContainerBuilder()
            .setAccentColor(C.Warning)
            .addTextDisplayComponents(td => td.setContent(
                `## ⚠️ Delete Server\n` +
                `Are you sure you want to delete \`${output.name}\`?\n` +
                `-# This is permanent — all data and files will be lost forever.`
            ))
            .addActionRowComponents(row =>
                row.addComponents(
                    new ButtonBuilder().setCustomId('AcceptDelete').setLabel('Yes, Delete').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('RejectDelete').setLabel('No, Cancel').setStyle(ButtonStyle.Danger),
                )
            );

        msg.edit({ components: [confirmContainer], ...V2 });

        const filter = i => i.user.id === message.author.id;
        const Collector = msg.createMessageComponentCollector({ filter, time: 300000 });

        Collector.on('collect', async i => {
            i.deferUpdate();
            Collector.stop();
            if (i.customId === "AcceptDelete") {
                msg.edit({ components: [loadingMsg('Deleting server...')], ...V2 });

                axios({
                    url: config.pterodactyl.host + "/api/admin/servers/" + output.uuid,
                    method: 'get',
                    followRedirect: true,
                    maxRedirects: 5,
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }).then(deleted => {
                    axios({
                        url: config.pterodactyl.host + "/api/admin/servers/" + output.uuid,
                        method: 'DELETE',
                        followRedirect: true,
                        maxRedirects: 5,
                        headers: {
                            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        data: { force: true, delete_backups: true }
                    }).then(() => {
                        msg.edit({ components: [successMsg('Server Deleted', `\`${output.name}\` has been permanently removed.`)], ...V2 });
                        if (!serverCount.get(message.author.id)) return;
                        serverData.findOne({ serverAdminID: output.uuid }).then(async (data) => {
                            if (data) {
                                if (data.type === 'gameserver') {
                                    serverCount.subtract(message.author.id + '.gameused', 1);
                                } else if (data.type === 'botserver') {
                                    serverCount.subtract(message.author.id + '.botused', 1);
                                }
                            }
                        }).then(() => { serverData.deleteOne({ serverAdminID: output.uuid }); }).catch(err => {
                            console.log(err);
                        });
                    }).catch(err => {
                        msg.edit({ components: [errorMsg('Error', `Failed to delete server: ${err.message}`)], ...V2 });
                    });
                });
            }
            if (i.customId === "RejectDelete") {
                msg.edit({ components: [successMsg('Cancelled', 'Server deletion cancelled.')], ...V2 });
            }
        });

        Collector.on('end', (collected, reason) => {
            if (reason === 'time') {
                msg.edit({ components: [warnMsg('Timed Out', 'Deletion confirmation timed out.')], ...V2 });
            }
        });
    });
};