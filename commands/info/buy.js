// const Discord = require('discord.js')

// module.exports = {
//     name: "buy",
//     aliases: [], 
//     async run(client, message, args){
//         if(!args[0]) return message.channel.send(`Corect command format: \`!buy server\``)
//         if(args[0] === "server"){
//             if(!userServers.get(message.author.id)) return message.channel.send({embeds:[
//                 new Discord.EmbedBuilder()
//                 .setTitle(`:x: | Error`)
//                 .setColor(`RED`)
//                 .setDescription(":x: You dont have an account created. type `!user new` to create one")
//             ]})
//             message.channel.send({embeds:[
//                 new Discord.EmbedBuilder()
//                 .setColor(`BLUE`)
//                 .addField(`❗ | Invite Rewards`, `Are you sure you want to sell \`3 invites\` for \`a server\`?`)
//                 .setFooter(`You have 30 seconds till this embed expires`)
//             ]}).then(x => {
//                 x.react('✅')
//                 x.react('❌')

//                 let filter = (reaction, user) => user.id === message.author.id;

//                 const collector = x.createReactionCollector({ filter, time: 30000, max: 1});

//                 collector.on('collect', (reaction, user) => {
//                     if(!invinfo.get(message.author.id)) return message.channel.send({embeds:[
//                         new Discord.EmbedBuilder()
//                         .setTitle(`:x: | Something went wrong, you dont have invites saved in my database, type ">invites" to fix it`)
//                         .setColor("RED")
//                     ]})
//                     if(reaction.emoji.name === '✅'){

//                         if(invinfo.get(message.author.id).invites >= 3){
//                             message.channel.send({embeds:[
//                                 new Discord.EmbedBuilder()
//                                 .setColor("BLUE")
//                                 .addField(`✅ | Payment succesufuly completed`, `You just bought a **simple** server!`)
//                             ]})
//                             invinfo.subtract(message.author.id  + '.invites',  3)
//                             userServers.add(message.author.id + ".simple.have", 1)
//                             invinfo.add(message.author.id + ".sold", 3)
//                         }else{
//                             message.channel.send({embeds:[
//                                 new Discord.EmbedBuilder()
//                                 .setTitle(`:x: | You dont have enough invites`)
//                                 .setColor(`RED`)
//                             ]})
//                             return
//                         }
//                     }else{
//                         message.channel.send({embeds:[
//                             new Discord.EmbedBuilder()
//                             .setTitle(`:x: | Canceled`)
//                             .setColor(`RED`)
//                         ]})
//                     }
//                 })
//             })
//         }
//     }
// }