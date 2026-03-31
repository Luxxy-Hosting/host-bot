const userData = require('../../models/userData');
const { ContainerBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const config = require('../../config.json');
const axios = require('axios');
const { C, V2, errorMsg, successMsg, warnMsg, loadingMsg, textContainer } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id });
    if (!userDB) return message.reply({ components: [errorMsg('No Account', `You don't have an account. Type \`${config.bot.prefix}user new\` to create one.`)], ...V2 });
    if (message.author.id === '517107022399799331') return message.reply({ components: [errorMsg('Denied', "You can't delete your owner's account")], ...V2 });

    let owner_uuid = null;
    if (userDB.consoleID && userDB.consoleID.length > 20) {
        owner_uuid = userDB.consoleID;
    } else if (userDB.email) {
        try {
            const uResE = await axios.get(config.pterodactyl.host + "/api/admin/users", {
                headers: { 'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey, 'Accept': 'application/json' },
                params: { search: userDB.email, per_page: 50 }
            });
            const match = (uResE.data.users?.data || []).find(u => u.email?.toLowerCase() === userDB.email.toLowerCase());
            if (match) owner_uuid = match.uuid;
        } catch(e) {}
    }
    if (!owner_uuid) return message.reply({ components: [errorMsg('Not Found', 'Could not find your connected account on the panel!')], ...V2 });

    await axios({
        url: config.pterodactyl.host + "/api/admin/users/" + owner_uuid + "/servers?per_page=100",
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }
    }).then(async response => {
        let servers = (response.data?.servers?.data || []).map(x => x.uuid);

        const confirmContainer = new ContainerBuilder()
            .setAccentColor(C.Warning)
            .addTextDisplayComponents(td => td.setContent(
                `## ⚠️ Delete Account\n` +
                `You are going to delete your account: \`${userDB.username}\`\n` +
                `${servers.length > 0 ? `This will also delete your **${servers.length}** server${servers.length > 1 ? 's' : ''}.\n` : ''}` +
                `-# This action is not reversible. All your data will be lost forever.`
            ))
            .addActionRowComponents(row =>
                row.addComponents(
                    new ButtonBuilder().setCustomId('DeleteTheAccount').setLabel('Yes, Delete').setStyle(ButtonStyle.Success),
                    new ButtonBuilder().setCustomId('CancelAccountDeletion').setLabel('No, Cancel').setStyle(ButtonStyle.Danger),
                )
            );

        let msg = await message.reply({ components: [confirmContainer], ...V2 });

        const filter = i => i.user.id === message.author.id;
        const collector = msg.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', async i => {
            i.deferUpdate();
            if (i.customId === "DeleteTheAccount") return collector.stop('DeleteTheAccount');
            if (i.customId === "CancelAccountDeletion") return collector.stop('CancelAccountDeletion');
        });

        collector.on('end', async (a, reason) => {
            if (reason === 'time') {
                return msg.edit({ components: [warnMsg('Timed Out', 'Account deletion timed out.')], ...V2 });
            }
            if (reason === 'CancelAccountDeletion') {
                return msg.edit({ components: [errorMsg('Cancelled', 'Account deletion cancelled.')], ...V2 });
            }
            if (reason === 'DeleteTheAccount') {
                if (servers.length > 0) {
                    await msg.edit({ components: [loadingMsg('Deleting servers...')], ...V2 });
                    await Promise.all(servers.map(async server => {
                        await axios({
                            url: config.pterodactyl.host + "/api/admin/servers/" + server,
                            method: 'DELETE',
                            followRedirect: true,
                            maxRedirects: 5,
                            headers: {
                                'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                                'Content-Type': 'application/json',
                                'Accept': 'application/json',
                            },
                            data: { force: true, delete_backups: true }
                        }).then(() => {}).catch(err => {});
                    }));
                }

                await msg.edit({ components: [loadingMsg('Deleting account...')], ...V2 });

                await axios({
                    url: config.pterodactyl.host + "/api/admin/users/" + owner_uuid,
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }).then(() => {
                    const userData1 = require('../../models/userData');
                    userData1.deleteOne({ ID: `${userDB.ID}` }).catch(err => console.log(err));
                    serverCount.set(message.author.id, {
                        gameused: 0,
                        botused: 0,
                        gamehave: 1,
                        bothave: 2
                    });
                    msg.edit({ components: [successMsg('Account Deleted', 'Your account and all servers have been permanently removed.')], ...V2 });
                }).catch(err => {
                    msg.edit({ components: [errorMsg('Error', 'There was an error deleting your account.')], ...V2 });
                    console.log(err);
                });
            }
        });

    }).catch(err => {
        message.channel.send(`${err}.`);
    });
};
