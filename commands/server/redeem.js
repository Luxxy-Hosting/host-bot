const config = require('../../config.json');
module.exports = async(client, message, args) => {
    const user = message.author;
    
    const code = args[1]
    
    const oneoneone = (userid, amount) => {
        serverCount.set(userid, {
            used: serverCount.get(userid).used,
            have: amount,
        })
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
    
    oneoneone(user.id, oldbal + codes.get(code).balance)
    
    message.reply(`You have redeemed ${codes.get(code).balance} servers! \n Check with \`${config.bot.prefix}server count\``)
    codes.delete(code)
}