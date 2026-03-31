const { ContainerBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const { C, V2, errorMsg } = require('../../helpers/components');
const userData = require('../../models/userData');
const config = require('../../config.json');

module.exports = async (client, message, args) => {
    const userDataDB = await userData.findOne({ ID: message.author.id });
    if (!userDataDB) return message.reply({ components: [errorMsg('No Account', `You don't have an account. Type \`${config.bot.prefix}user new\` to create one.`)], ...V2 });

    const container = new ContainerBuilder()
        .setAccentColor(C.Success)
        .addTextDisplayComponents(td => td.setContent(`## 🔗 Account Info`))
        .addSeparatorComponents(sep => sep.setDivider(true))
        .addTextDisplayComponents(td => td.setContent(
            `**Username:** \`${userDataDB.username}\`\n` +
            `**Link Date:** \`${userDataDB.linkDate}\`\n` +
            `**Link Time:** \`${userDataDB.linkTime}\``
        ));

    message.channel.send({ components: [container], ...V2 });
};