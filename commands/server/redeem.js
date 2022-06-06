const config = require('../../config.json');
module.exports = async(client, message, args) => {
    if (!userData.get(message.author.id)) {
        message.reply(":x: You dont have an account created. type `!user new` to create one");
        return;
    }
    const user = message.author;
    
    const code = args[1]
    
    const oneoneone = (userid, amount) => {
        serverCount.add(userid + '.have', amount)
    }
    
    const oldbal = serverCount.get(user.id + '.have')
    if (!code) {
        return message.reply(`Usage: \`${config.bot.prefix}server redeem <code>\``)
    }

    if (!codes.get(code)) {
        return message.reply(`That code does not exist 💀`)
    }

    if (codes.get(code).balance <= 0) {
        return message.reply(`That code has been redeemed 💀`)
    }
    
    oneoneone(user.id, codes.get(code).balance)
    
    message.reply(`You have redeemed ${codes.get(code).balance} servers! \n Check with \`${config.bot.prefix}server count\``)
    codes.delete(code)
}
