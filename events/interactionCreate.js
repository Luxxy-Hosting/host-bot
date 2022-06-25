const config = require('../config.json')
const Discord = require('discord.js')
const wait = require('node:timers/promises').setTimeout;
module.exports = async (client, interaction) => {
    // if(interaction.message.channelId === config.channelID.ticketChannel && interaction.customId === 'IDDD'){
    //     const guild = interaction.message.guild;
    //     const {message} = interaction

    //     const PingChannel = interaction.message.guild.channels.cache.find(channel => channel.name === interaction.user.username.toLowerCase() + '-ticket')
    //     if(PingChannel) {
    //         interaction.reply({content:`<@${interaction.user.id}> You already have a ticket, <#${PingChannel.id}>`, ephemeral: true}); 
    //         PingChannel.send(`${interaction.user} Here is your ticket :)`)
    //         return
    //     }

    //     let role = message.guild.roles.cache.find(r => r.id === config.roleID.staff)

    //     let channel = await message.guild.channels.create(interaction.user.username+'-ticket', {
    //         parent: config.parentID.ticketParent,
    //         permissionOverwrites: [
    //             {
    //                 id: interaction.user.id,
    //                 allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
    //             }, {
    //                 id: message.guild.id,
    //                 deny: ['VIEW_CHANNEL']
    //             }, {
    //                 id: role,
    //                 allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY']
    //             }
    //         ]
    //     })

    //     const WelcomToTicket = await channel.send({content: `<@${interaction.user.id}>`, embeds:[
    //         new Discord.MessageEmbed()
    //         .setTitle(`${interaction.user.username}'s Ticket`)
    //         .setColor(`BLUE`)
    //         .setDescription(`Welcome to Artiom's Hosting official support, how can we help you?\nPlease describe your problem as much as possible \:D`)
    //         .setFooter({text:`Please do not ping/ghost ping! | interact with 🔒 to close the ticket`})
    //         ],
    //         components: [
    //             new Discord.MessageActionRow()
    //             .addComponents(
    //                 new Discord.MessageButton()
    //                     .setEmoji('🔒')
    //                     .setCustomId('CloseTicket')
    //                     .setLabel('Close Ticket')
    //                     .setStyle('SECONDARY'),
    //             )
    //         ]
    //     })
    //     interaction.reply({
    //         content: `<@${interaction.user.id}> Your ticket had been created, check <#${WelcomToTicket.channel.id}>`,
    //         ephemeral: true
    //     })
    // }

    // if(client.channels.cache.get(interaction.message.channelId)?.parentId === config.parentID.ticketParent && interaction?.customId === 'CloseTicket'){
    //     interaction.reply(`Closing This Ticket . . .`)
    //     await wait(1000)
    //     client.channels.cache.get(interaction.message.channelId)?.delete().catch(() => {})
    // }
    if (!interaction.isCommand()) return;
    if (interaction.channel.id === '950030827167817798') return interaction.reply({ content: 'You can\'t use this command in this channel',  ephemeral: true });
        
        const command = client.slash.get(interaction.commandName);
        if (!command) return interaction.reply({ content: 'developers did a oops error', ephemeral: true });
        
        if (command.ownerOnly) {
            if (interaction.user.id !== config.roleID.admin) {
                return interaction.reply({ content: "This command only can be use by Luxxy hosting owner Admins", ephemeral: true });
            }
        }
        
        const args = [];
        
        for (let option of interaction.options.data) {
            if (option.type === 'SUB_COMMAND') {
                if (option.name) args.push(option.name);
                option.options?.forEach(x => {
                    if (x.value) args.push(x.value);
                });
            } else if (option.value) args.push(option.value);
        }
        
        try {
            command.run(client, interaction, args)
        } catch (e) {
            interaction.reply({ content: e.message });
        }
}