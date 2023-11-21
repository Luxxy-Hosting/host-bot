const Discord = require('discord.js');

module.exports = {
    name: 'count',
    description: 'sends how many servers you used',
    type: Discord.ApplicationCommandType.ChatInput,
    category: "server",

    run: async (client, interaction, args) => {
        const user = interaction.user
        if(!serverCount.get(user.id)) {
            await serverCount.set(user.id, {
                mineused: 0,
                botused: 0,
                minehave: 1,
                bothave: 2
            })
        }
    
        interaction.reply({
            embeds:[
                new Discord.EmbedBuilder()
                .setTitle(`${success} ${user.username}'s Server Count`)
                .setColor(0x677bf9)
                .setDescription(`**${user.username}** have used \`${serverCount.get(user.id).used}/${serverCount.get(user.id).have}\` servers`)
            ]
        })
    }
}