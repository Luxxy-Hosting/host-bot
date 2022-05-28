const Discord = require("discord.js");
const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = {
    name: "exec",
    category: "Owner",
    description: "Execute a command",
    run: async (client, message, args) => {
        if (message.author.id === "517107022399799331") {
            exec(args.join(" "), (err, stdout, stderr) => {
                if (err) {
                    message.channel.send(err);
                    return;
                }
                if (stderr) {
                    message.channel.send(stderr);
                    return;
                }
                message.channel.send({ content: `\`\`\`${stdout}\`\`\``  }).catch(err => {
                    message.channel.send(`sus ${err}`);
                });
            });
        } else {
            message.reply('<a:whatisthis:951132055134162954>')
        }
    }
}