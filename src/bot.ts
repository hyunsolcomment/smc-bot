import { Client, Events, GatewayIntentBits } from "discord.js";
import { config } from 'dotenv';
import TeamCommand from "./commands/team";

config();

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
	GatewayIntentBits.MessageContent,
  ]
});

const Prefix = {
	isPrefix: (str: string) => {
		const prefixes = process.env.PREFIX.split(",");

		for(let p of prefixes) {
			if(str.startsWith(p)) return true;
		}
	
		return false;
	},

	without: (message: string) => {
		const prefixes = process.env.PREFIX.split(",");

		let _message = message;

		for(let prefix of prefixes) {
			if(_message.startsWith(prefix))
				return message.slice(prefix.length, message.length);
		}

		return message;
	}
}

client.on(Events.MessageCreate, async (e) => {
	if(e.author.bot) return;

	const user 		= e.author;
	const content 	= e.content;
	const noPrefix 	= Prefix.without(content);

	const cmd 		= noPrefix.split(" ")[0];
	const args		= noPrefix.replace(cmd, "").trim().split(/\s+/).filter(str => str.length > 0);

	if(Prefix.isPrefix(content)) {

		switch(cmd) {
			case "팀":
				TeamCommand.execute(e, user, args);
				break;
		}
	}
})

client.on('ready', () => console.log(`히유 봇 켜짐`));
client.login(process.env.TOKEN);