"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const discord_js_1 = require("discord.js");
const dotenv_1 = require("dotenv");
const team_1 = require("./commands/team");
(0, dotenv_1.config)();
exports.client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
    ]
});
const Prefix = {
    isPrefix: (str) => {
        const prefixes = process.env.PREFIX.split(",");
        for (let p of prefixes) {
            if (str.startsWith(p))
                return true;
        }
        return false;
    },
    without: (message) => {
        const prefixes = process.env.PREFIX.split(",");
        let _message = message;
        for (let prefix of prefixes) {
            if (_message.startsWith(prefix))
                return message.slice(prefix.length, message.length);
        }
        return message;
    }
};
exports.client.on(discord_js_1.Events.MessageCreate, async (e) => {
    if (e.author.bot)
        return;
    const user = e.author;
    const content = e.content;
    const noPrefix = Prefix.without(content);
    const cmd = noPrefix.split(" ")[0];
    const args = noPrefix.replace(cmd, "").trim().split(/\s+/).filter(str => str.length > 0);
    if (Prefix.isPrefix(content)) {
        switch (cmd) {
            case "팀":
                team_1.default.execute(e, user, args);
                break;
        }
    }
});
exports.client.on('ready', () => console.log(`히유 봇 켜짐`));
exports.client.login(process.env.TOKEN);
