const { EmbedBuilder } = require("discord.js");
const { post } = require("node-superfetch");

module.exports = {
    name: "eval",
    category: "admin",
    description: "Execute JavaScript code (Owner only)",
    options: [
        {
            name: "code",
            description: "JavaScript code to execute",
            type: 3, // STRING
            required: true,
        }
    ],
    ownerOnly: true,
    run: async (client, interaction) => {
        const code = interaction.options.getString('code');
        
        const embed = new EmbedBuilder()
            .addFields({ name: "Input", value: "```js\n" + code + "```"});

        try {
            if (!code) return interaction.reply("Please include the code.");
            let evaled;

            if (code.includes(`SECRET`) || code.includes(`TOKEN`) || code.includes("process.env")) {
                evaled = "No, shut up, what will you do it with the token?";
            } else {
                evaled = await eval(code);
            }

            if (typeof evaled !== "string") evaled = await require("util").inspect(evaled, { depth: 0 });

            let output = clean(evaled);
            if (output.length > 1024) {
                try {
                    const { body } = await post("https://hastebin.com/documents").send(output);
                    embed.addFields({ name: "Output", value: `https://hastebin.com/${body.key}.js` }).setColor(0xFF0000);
                } catch {
                    embed.addFields({ name: "Output", value: "```js\nOutput too long and hastebin failed```" }).setColor(0xFF0000);
                }
            } else {
                embed.addFields({ name: "Output", value: "```js\n" + output + "```" }).setColor(0xFF0000);
            }

            await interaction.reply({embeds: [embed], ephemeral: true});

        } catch (error) {
            let err = clean(error);
            if (err.length > 1024) {
                try {
                    const { body } = await post("https://hastebin.com/documents").send(err);
                    embed.addFields({ name: "Output", value: `https://hastebin.com/${body.key}.js`}).setColor(0xFF0000);
                } catch {
                    embed.addFields({ name: "Output", value: "```js\nError too long and hastebin failed```"}).setColor(0xFF0000);
                }
            } else {
                embed.addFields({ name: "Output", value: "```js\n" + err + "```"}).setColor(0xFF0000);
            }

            await interaction.reply({embeds: [embed], ephemeral: true});
        }
    }
}

function clean(string) {
    if (typeof string === "string") {
        return string.replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203))
    } else {
        return string;
    }
}