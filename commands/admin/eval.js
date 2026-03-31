const { ContainerBuilder, MessageFlags } = require("discord.js");
const { post } = require("node-superfetch");
const { errorMsg, successMsg, C, V2 } = require("../../helpers/components");

module.exports = {
    name: "eval",
    category: "Owner",
    description: "Eval Code",
    run: async (client, message, args) => {
        if (message.author.id === "517107022399799331") {
            const code = args.join(" ");
            if (!code) return message.channel.send({ components: [errorMsg('Missing Code', 'Please include the code.')], ...V2 });
            let evaled;

            if (code.includes(`SECRET`) || code.includes(`TOKEN`) || code.includes("process.env")) {
                evaled = "No, shut up, what will you do it with the token?";
            } else {
                try {
                    evaled = await eval(code);
                } catch (error) {
                    let err = clean(error);
                    if (err.length > 1024) {
                        const { body } = await post("https://hastebin.com/documents").send(err);
                        return message.channel.send({ components: [errorMsg('Eval Error', `Output too long: https://hastebin.com/${body.key}.js`)], ...V2 });
                    } else {
                        return message.channel.send({ components: [errorMsg('Eval Error', `\`\`\`js\n${err}\n\`\`\``)], ...V2 });
                    }
                }
            }

            if (typeof evaled !== "string") evaled = require("util").inspect(evaled, { depth: 0 });

            let output = clean(evaled);
            if (output.length > 1024) {
                const { body } = await post("https://hastebin.com/documents").send(output);
                const container = new ContainerBuilder()
                    .setAccentColor(C.Success)
                    .addTextDisplayComponents(td => td.setContent(`## 💻 Eval Result`))
                    .addSeparatorComponents(sep => sep.setDivider(true))
                    .addTextDisplayComponents(td => td.setContent(`**Output:** https://hastebin.com/${body.key}.js`));
                message.channel.send({ components: [container], ...V2 });
            } else {
                const container = new ContainerBuilder()
                    .setAccentColor(C.Success)
                    .addTextDisplayComponents(td => td.setContent(`## 💻 Eval Result`))
                    .addSeparatorComponents(sep => sep.setDivider(true))
                    .addTextDisplayComponents(td => td.setContent(`**Output:**\n\`\`\`js\n${output}\n\`\`\``));
                message.channel.send({ components: [container], ...V2 });
            }
        } else {
            message.channel.send({
                components: [errorMsg('Error', 'You are not the owner of this bot.')],
                ...V2
            });
        }
    }
}
function clean(string) {
    if (typeof string === "string") {
        return string.replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203));
    } else {
        return string;
    }
}