"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const TeamCommand = {
    execute: async (e, user, args) => {
        // 도움말 출력
        if (args.length === 0 || args?.[0] === "도움말") {
            e.reply({ embeds: [
                    new discord_js_1.EmbedBuilder().setColor("Green").setTitle("팀 도움말")
                        .setDescription("``!팀 생성 *[팀 이름] [@유저들 언급]``: 팀을 생성합니다. 만약 `[@유저들 언급]`이 있다면, 해당 유저들을 생성된 팀의 팀원으로 포함시킵니다. \n``!팀 [제거/삭제] *[팀 이름]``: 팀을 삭제합니다.\n``!팀 팀원추가 *[팀 이름] [@유저들 언급]``: 팀원을 특정 팀에 추가합니다.\n``!팀 팀원제거 *[팀 이름] [@유저들 언급]``: 팀원을 특정 팀에서 제거합니다.\n")
                        .setFooter({ text: "*은 필수로 입력되어야 하는 항목입니다." })
                ] });
            return;
        }
        // 도움말이 아닌 데, 인자가 1개 밖에 없는 상황 = 명령어 이상하게 입력함
        // -> 하려는 걸 유추해서 알려주기
        if (args.length === 1) {
            switch (args[0]) {
                case "팀원제거":
                    e.reply("팀원을 제거하려고 하셨나요? `!팀 팀원제거 [팀 이름]`으로 사용할 수 있어요.");
                    break;
                case "팀원추가":
                    e.reply("팀원을 추가하려고 하셨나요? `!팀 팀원추가 [팀 이름] [@유저들 언급]`으로 사용할 수 있어요.");
                    break;
                case "생성":
                    e.reply("팀을 생성하려고 하셨나요? `!팀 생성 [팀 이름] [@유저들 언급]`으로 사용할 수 있어요.");
                    break;
                case "삭제":
                case "제거":
                    e.reply("팀을 제거하려고 하셨나요? `!팀 [삭제/제거] [@유저들 언급]`으로 사용할 수 있어요.");
                    break;
                default:
                    e.reply("어떤 명령을 내리려는 지 모르겠어요. `!팀 도움말`을 입력하여 사용할 수 있는 명령어들을 확인할 수 있습니다!");
                    break;
            }
            return;
        }
        let madeByRole = e.guild.roles.cache.find(role => role.name === "히유에 의해 생성됨");
        const teamName = args[1];
        const teamRole = e.guild.roles.cache.find(role => role.name === `HiuTeam_${teamName}`);
        const teamPermission = ['ViewChannel', 'SendMessages', 'Connect'];
        const users = [];
        let usersStr = "";
        // 팀 이름 검토
        if (teamName.startsWith("<@")) {
            e.reply("팀 이름이 잘 못 된 것 같아요. 팀 이름에서는 유저를 언급하지 않아야 해요!");
            return;
        }
        // 팀 설정에 필요한 역할이 서버에 없다면 생성하기
        if (!madeByRole) {
            madeByRole = await e.guild.roles.create({ name: "히유에 의해 생성됨 " });
        }
        // 언급된 유저 파싱하기
        for (let i = 2; i < args.length; i++) {
            if (args[i].startsWith('<@') && args[i].endsWith('>')) {
                let userID = args[i].slice(args[i].startsWith("<@&") ? 3 : 2, args[i].length - 1);
                let user = e.guild.members.cache.get(userID);
                if (user && !users.includes(user))
                    users.push(user);
            }
        }
        // 언급된 유저 배열을 문자열로 사용하고자 할 때 사용하는 변수 선언하기
        usersStr = users.length === 1 ? users[0].displayName : users.map(user => user.displayName).join(",");
        switch (args[0]) {
            case "생성":
                // 이미 같은 이름의 팀 역할이 생성되어 있는 지 확인
                if (teamRole) {
                    e.reply({ embeds: [
                            new discord_js_1.EmbedBuilder()
                                .setColor('Red')
                                .setTitle('이미 같은 이름의 팀이 존재해요!')
                                .setDescription(`이미 \`${teamName}\`(이)라는 팀이 등록되어 있어요.\n\`!팀 삭제 ${teamName}\`을 입력하여 팀을 삭제할 수 있어요.`)
                        ] });
                    return;
                }
                // 팀 역할 생성
                let role = await e.guild.roles.create({ name: `HiuTeam_${teamName}` });
                // 유저들에게 팀 역할 부여하기
                users.forEach(user => user.roles.add(role));
                // 카테고리 생성
                const category = await e.guild.channels.create({ name: teamName, type: discord_js_1.ChannelType.GuildCategory });
                await category.edit({
                    permissionOverwrites: [
                        {
                            id: e.guild.roles.everyone,
                            deny: ['ViewChannel']
                        },
                        {
                            id: role.id,
                            allow: teamPermission
                        },
                        {
                            id: madeByRole.id,
                            allow: teamPermission
                        }
                    ]
                });
                await category.children.create({ type: discord_js_1.ChannelType.GuildText, name: "일반" });
                await category.children.create({ type: discord_js_1.ChannelType.GuildVoice, name: "일반" });
                console.log("작업 끝!");
                // 작업 완료 출력하기
                e.reply({ embeds: [new discord_js_1.EmbedBuilder().setColor("Green").setTitle(`${teamName} 팀(을)를 생성했어요.`).setDescription(usersStr.length > 0 ? `${usersStr}(이)가 팀에 포함되었습니다!` : '아무도 팀에 포함되지 않았어요. \n`!팀 팀원추가 [팀 이름] [@유저들 언급]`으로 누군가를 팀에 포함시킬 수 있습니다!')] });
                break;
            case "팀원추가":
                if (users.length === 0) {
                    e.reply('팀에 추가할 유저가 언급되지 않았어요. 팀원제거 명령은 예를들어 `!팀 팀원추가 [팀 이름] @히유` 이렇게 입력되어야 해요!');
                    return;
                }
                if (teamRole) {
                    users.forEach(user => user.roles.add(teamRole));
                    e.reply(`${usersStr}(을)를 **${teamName}** 팀에 추가했습니다!`);
                }
                else {
                    e.reply(`${teamName}팀은 없는 것 같아요. \`\`!팀 생성 ${teamName}\`\`을 입력하여 팀을 생성할 수 있어요.`);
                }
                break;
            case "팀원제거":
                if (users.length === 0) {
                    e.reply('팀에서 제거할 유저가 언급되지 않았어요. 팀원제거 명령은 예를들어 `!팀 팀원제거 [팀 이름] @히유` 이렇게 입력되어야 해요!');
                    return;
                }
                if (teamRole) {
                    users.forEach(user => user.roles.remove(teamRole));
                    e.reply(`${usersStr}(을)를 ${teamName} 팀에서 제거했어요.`);
                }
                else {
                    e.reply(`${teamName} 팀은 없는 것 같아요. \`\`!팀 생성 ${teamName}\`\`을 입력하여 팀을 생성할 수 있어요.`);
                }
                break;
            case "제거":
            case "삭제":
                // 팀 역할 제거
                if (teamRole) {
                    // 팀 카테고리 및 해당 카테고리 하위 채널들 제거
                    e.guild.channels.cache.filter(c => c.type === discord_js_1.ChannelType.GuildCategory && !c.permissionsFor(e.guild.roles.everyone).has("ViewChannel") && c.permissionsFor(madeByRole).has(teamPermission) && c.permissionsFor(teamRole).has(teamPermission)).forEach((c) => {
                        c.children.cache.forEach(async (c2) => await c2.delete());
                        c.delete();
                    });
                    teamRole.delete();
                    // 작업 완료 출력하기
                    e.reply({ embeds: [new discord_js_1.EmbedBuilder().setColor("Green").setTitle(`${teamName} 팀(을)를 삭제했어요.`)] });
                }
                else {
                    e.reply(`${teamName} 팀은 없는 것 같아요. \`\`!팀 생성 ${teamName}\`\`을 입력하여 팀을 생성할 수 있어요.`);
                }
                break;
            default:
                e.reply("알 수 없는 명령이에요. `!팀 도움말`을 입력하여 사용할 수 있는 명령어를 확인할 수 있어요.");
                break;
        }
    }
};
exports.default = TeamCommand;
