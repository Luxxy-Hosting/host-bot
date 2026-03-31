const { ContainerBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');
const wait = require('node:timers/promises').setTimeout;
const validator = require('validator');
const moment = require("moment");
const fs = require('fs');
const userData = require('../../models/userData');
const db = require('quick.db');
const server1 = new db.table("FreeServerCount");
const { C, V2, errorMsg, successMsg, warnMsg, loadingMsg, textContainer } = require('../../helpers/components');

module.exports = async (client, message, args) => {
    const userDB = await userData.findOne({ ID: message.author.id });

    if (userDB) {
        return message.reply({ components: [errorMsg('Already Linked', 'You already have a panel account linked to your Discord account.')], ...V2 });
    }

    let getPassword = () => {
        const CAPSNUM = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        var password = "";
        while (password.length < 10) {
            password += CAPSNUM[Math.floor(Math.random() * CAPSNUM.length)];
        }
        return password;
    };

    let category = message.guild.channels.cache.find(c => c.id === config.parentID.createAccount);
    let channel = await message.guild.channels.create({
        name: `${message.author.username}-${message.author.discriminator}`,
        parent: category.id,
        type: 0,
        permissionOverwrites: [{
            id: message.author.id,
            allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"],
        }, {
            id: message.guild.id,
            deny: ["ViewChannel", "SendMessages"],
        }]
    });
    message.reply({ components: [textContainer(C.Info, `📨 Please check ${channel} to create your account!`)], ...V2 });

    const welcomeContainer = new ContainerBuilder()
        .setAccentColor(C.Blurple)
        .addTextDisplayComponents(td => td.setContent(
            `## 👋 Welcome to Luxxy Hosting\n` +
            `📰 In order to continue, please read our terms of service and privacy policy located in ${client.channels.cache.get(config.channelID.legal)}.\n\n` +
            `You may only create an account and use our services if you accept our terms of service and privacy policy.\n\n` +
            `**Do you accept our legal?**`
        ))
        .addTextDisplayComponents(td => td.setContent(`-# This message expires in 5 minutes`))
        .addActionRowComponents(row =>
            row.addComponents(
                new ButtonBuilder().setCustomId('AcceptLegal').setLabel('Yes, I Accept').setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId('RejectLegal').setLabel('No').setStyle(ButtonStyle.Danger),
            )
        );

    let msg = await channel.send({ components: [welcomeContainer], ...V2 });

    const filter = i => i.user.id === message.author.id;
    const legalCollector = msg.createMessageComponentCollector({ filter, time: 300000 });

    let email;
    let username;

    legalCollector.on('collect', async legalInteraction => {
        legalInteraction.deferUpdate();
        if (legalInteraction.customId === "RejectLegal") return legalCollector.stop('RejectLegal');
        if (legalInteraction.customId === "AcceptLegal") return legalCollector.stop('Success');
    });

    legalCollector.on('end', async (a, reason) => {
        if (reason === 'time') {
            channel.send({ components: [errorMsg('Expired', 'Time expired, closing this channel...')], ...V2 });
            await wait(3000);
            try { channel.delete(); } catch (err) {}
            return;
        }
        if (reason === 'RejectLegal') {
            channel.send({ components: [errorMsg('Rejected', 'Without accepting our legal, we cannot allow you to create an account.')], ...V2 });
            await wait(5000);
            try { channel.delete(); } catch (err) {}
            return;
        }

        if (reason === 'Success') {
            const filter = m => m.author.id === message.author.id;
            const collector = channel.createMessageCollector({ filter, time: 300000 });

            msg.edit({
                components: [
                    new ContainerBuilder()
                        .setAccentColor(C.Gold)
                        .addTextDisplayComponents(td => td.setContent(`## ✉️ What is your email address?\n-# Must be a valid email. Type "cancel" to stop.`))
                ],
                ...V2
            });

            collector.on('collect', async m => {
                if (m.content.toLowerCase() === "cancel") return collector.stop("cancelingCreation");
                try { m.delete(); } catch (err) {}

                if (!email) {
                    if (!validator.isEmail(m.content.toLowerCase().trim())) {
                        let tempmsg = await channel.send({ components: [errorMsg('Invalid Email', 'That email is not valid. Please try again.')], ...V2 });
                        await wait(2000);
                        tempmsg.delete();
                        return;
                    } else {
                        msg.edit({
                            components: [
                                new ContainerBuilder()
                                    .setAccentColor(C.Gold)
                                    .addTextDisplayComponents(td => td.setContent(`## 👤 What should your username be?\n-# No spaces or special characters. Type "cancel" to stop.`))
                            ],
                            ...V2
                        });
                        email = m.content.toLowerCase().trim();
                    }
                } else if (!username) {
                    if (m.content.trim().split(" ").length > 1) {
                        let tempmsg = await channel.send({ components: [errorMsg('Invalid Username', 'No spaces or special characters allowed. Try again.')], ...V2 });
                        await wait(2000);
                        tempmsg.delete();
                        return;
                    } else {
                        msg.edit({ components: [loadingMsg('Creating your account...')], ...V2 });
                        username = m.content.toLowerCase().trim();
                        collector.stop("FinishedCreation");
                    }
                }
            });

            collector.on('end', async (collected, reason) => {
                if (reason === 'time') {
                    channel.send({ components: [errorMsg('Expired', 'Time expired, closing this channel...')], ...V2 });
                    await wait(3000);
                    try { channel.delete(); } catch (err) {}
                    return;
                }
                if (reason === 'cancelingCreation') {
                    channel.send({ components: [textContainer(C.Error, '🚫 Account creation cancelled, deleting channel...')], ...V2 });
                    await wait(3000);
                    try { channel.delete(); } catch (err) {}
                    return;
                }

                if (reason === 'FinishedCreation') {
                    if (!username || !email) return msg.edit({
                        components: [errorMsg('Error', 'Something went wrong — the email or username was not saved.')],
                        ...V2
                    });

                    const data = {
                        "username": username.toLowerCase(),
                        "email": email.toLowerCase(),
                        "name_first": username,
                        "name_last": "user",
                        "password": getPassword(),
                        "admin": false,
                        "language": "en"
                    };

                    axios({
                        url: config.pterodactyl.host + "/api/admin/users",
                        method: 'POST',
                        followRedirect: true,
                        maxRedirects: 5,
                        headers: {
                            'Authorization': 'Bearer ' + config.pterodactyl.adminApiKey,
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                        },
                        data: data,
                    }).then(async user => {
                        message.member.roles.add(message.guild.roles.cache.get(config.roleID.client));
                        userData({
                            ID: message.author.id,
                            consoleID: user.data.user?.uuid || user.data.uuid || user.data.id,
                            email: email,
                            username: username,
                            linkTime: moment().format("HH:mm:ss"),
                            linkDate: moment().format("YYYY-MM-DD"),
                        }).save();
                        server1.set(message.author.id, {
                            gameused: 0,
                            botused: 0,
                            gamehave: 1,
                            bothave: 2
                        });

                        const resultContainer = new ContainerBuilder()
                            .setAccentColor(C.Success)
                            .addTextDisplayComponents(td => td.setContent(`## ✅ Account Created Successfully`))
                            .addSeparatorComponents(sep => sep.setDivider(true))
                            .addTextDisplayComponents(td => td.setContent(
                                `**Panel:** ${config.pterodactyl.host}\n` +
                                `**Email:** \`${email}\`\n` +
                                `**Username:** \`${username}\`\n` +
                                `**Password:** || ${data.password} ||`
                            ))
                            .addSeparatorComponents(sep => sep.setDivider(true))
                            .addTextDisplayComponents(td => td.setContent(
                                `Change your password after login via the account icon on the panel.\n\n` +
                                `-# ⚠️ This channel will be deleted in 30 minutes — save your credentials!`
                            ));

                        msg.edit({ components: [resultContainer], ...V2 });

                        await wait(1800000);
                        try { channel.delete(); } catch (err) {}
                    }).catch(async err => {
                        console.log(err);
                        const errDesc = err.toString() === 'Error: Request failed with status code 422'
                            ? `${err}\n\n> This is usually caused by special characters in the username, or the email/username is already taken.`
                            : `${err}`;

                        msg.edit({ components: [errorMsg('Account Creation Failed', `${errDesc}\n\n-# Error ID: \`${Date.now()}\` — open a ticket in <#971131084718895175>`)], ...V2 });
                        channel.send({ components: [textContainer(C.Error, 'This channel will be deleted in 10 seconds...')], ...V2 });
                        fs.appendFileSync('./logs/errorCreatingAccount.txt', `\n\n\n${Date.now()} -> ${err}`);
                        await wait(10000);
                        try { channel.delete(); } catch (err) {}
                    });
                }
            });
        }
    });
};
