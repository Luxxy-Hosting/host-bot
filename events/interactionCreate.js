const config = require('../config.json')
const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
    ChannelType
} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;
module.exports = async (client, interaction) => {
        // CREATE TICKET
        if (interaction.message.channelId === config.channelID.interactionsChannel && interaction.customId === 'CreateTicket') {
            const guild = message.guild;
    
            const existing = guild.channels.cache.find(channel => channel.name === `${interaction.user.username.toLowerCase()}-ticket`);
            if (existing) {
                interaction.reply({ content: `<@${interaction.user.id}> You already have a ticket: <#${existing.id}>`, ephemeral: true });
                existing.send(`${interaction.user} Here is your ticket :)`);
                return;
            }
    
            const staffRole = guild.roles.cache.get(config.roleID.support);
            const ticketChannel = await guild.channels.create({
                name: `${interaction.user.username}-ticket`,
                type: ChannelType.GuildText,
                parent: config.parentID.ticketParent,
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ]
                    },
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: staffRole.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ]
                    }
                ]
            });
    
            const embed = new EmbedBuilder()
                .setTitle(`${interaction.user.username}'s Ticket`)
                .setColor('Blue')
                .setDescription(`Welcome to Artiom's Hosting official support, how can we help you?\nPlease describe your problem as much as possible :D`)
                .setFooter({ text: `Please do not ping/ghost ping! | interact with 🔒 to close the ticket` });
    
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('CloseTicket')
                    .setEmoji('🔒')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Secondary)
            );
    
            const sent = await ticketChannel.send({
                content: `<@${interaction.user.id}>`,
                embeds: [embed],
                components: [row]
            });
    
            interaction.reply({
                content: `<@${interaction.user.id}> Your ticket has been created: <#${sent.channel.id}>`,
                ephemeral: true
            });
        }
    
        // APPLY DEVELOPER
        if (interaction.message.channelId === config.channelID.interactionsChannel && interaction.customId === 'ApplyDeveloper') {
            const guild = message.guild;
    
            const existing = guild.channels.cache.find(channel => channel.name === `${interaction.user.username.toLowerCase()}-dev`);
            if (existing) {
                interaction.reply({ content: `<@${interaction.user.id}> You already have a dev application: <#${existing.id}>`, ephemeral: true });
                existing.send(`${interaction.user} Here is your channel, please use it :)`);
                return;
            }
    
            const staffRole = guild.roles.cache.get(config.roleID.support);
            const devChannel = await guild.channels.create({
                name: `${interaction.user.username}-dev`,
                type: ChannelType.GuildText,
                parent: config.parentID.applyDeveloper,
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ]
                    },
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: staffRole.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ]
                    }
                ]
            });
    
            const embed = new EmbedBuilder()
                .setTitle(`${interaction.user.username}'s Channel`)
                .setColor('Blue')
                .setDescription(`Hi, we are happy to hear that you want to apply for volunteer developer at Artiom's Hosting. Please answer the following:\n\n> 1. What is your name?\n> 2. Contact Email?\n> 3. What coding languages do you know?\n> 4. Any projects you're proud of?\n> 5. Any other details?\n\nPlease wait for a response from Artiom :)`)
                .setFooter({ text: `Please do not ping/ghost ping! | interact with 🔒 to close the ticket` });
    
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('CloseTicket')
                    .setEmoji('🔒')
                    .setStyle(ButtonStyle.Secondary)
            );
    
            const sent = await devChannel.send({
                content: `<@${interaction.user.id}>`,
                embeds: [embed],
                components: [row]
            });
    
            interaction.reply({
                content: `<@${interaction.user.id}> Your dev application channel is ready: <#${sent.channel.id}>`,
                ephemeral: true
            });
        }
    
        // APPLY STAFF
        if (interaction.message.channelId === config.channelID.interactionsChannel && interaction.customId === 'ApplyStaff') {
            const guild = message.guild;
    
            const existing = guild.channels.cache.find(channel => channel.name === `${interaction.user.username.toLowerCase()}-staff`);
            if (existing) {
                interaction.reply({ content: `<@${interaction.user.id}> You already have a staff application: <#${existing.id}>`, ephemeral: true });
                existing.send(`${interaction.user} Here is your channel, please use it :)`);
                return;
            }
    
            const adminRole = guild.roles.cache.get(config.roleID.administrator);
            const staffChannel = await guild.channels.create({
                name: `${interaction.user.username}-staff`,
                type: ChannelType.GuildText,
                parent: config.parentID.applyStaff,
                permissionOverwrites: [
                    {
                        id: interaction.user.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ]
                    },
                    {
                        id: guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel]
                    },
                    {
                        id: adminRole.id,
                        allow: [
                            PermissionsBitField.Flags.ViewChannel,
                            PermissionsBitField.Flags.SendMessages,
                            PermissionsBitField.Flags.ReadMessageHistory
                        ]
                    }
                ]
            });
    
            const embed = new EmbedBuilder()
                .setTitle(`${interaction.user.username}'s Ticket`)
                .setColor('Blue')
                .setDescription(`u sure u want to apply? :D`)
                .setFooter({ text: `Please do not ping/ghost ping! | interact with 🔒 to close the ticket` });
    
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('CloseTicket')
                    .setEmoji('🔒')
                    .setLabel('Close Ticket')
                    .setStyle(ButtonStyle.Secondary)
            );
    
            const sent = await staffChannel.send({
                content: `<@${interaction.user.id}>`,
                embeds: [embed],
                components: [row]
            });
    
            interaction.reply({
                content: `<@${interaction.user.id}> Your staff application channel is ready: <#${sent.channel.id}>`,
                ephemeral: true
            });
        }
    
        // CLOSE TICKET
        if (
            ['ticketParent', 'applyDeveloper', 'applyStaff'].some(type =>
                client.channels.cache.get(interaction.message.channelId)?.parentId === config.parentID[type]
            ) &&
            interaction.customId === 'CloseTicket'
        ) {
            await interaction.reply('Closing this ticket...');
            await wait(1000);
            client.channels.cache.get(interaction.message.channelId)?.delete().catch(() => {});
        }
	if (!interaction.isChatInputCommand()) return;
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