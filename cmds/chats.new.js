(async(pl, sys, args, flags)=>{
	const ur = /[^_a-zA-Z0-9]/;
	let spl;

	{
		let temp = await game.db.filter({main_system:sys.ip}, "players");
		if (!temp.length) spl = pl;
		else spl = temp[0];
	}

	const chatroom = args[1] ? await game.db.get("chats", args[1]) : null;

	switch(args[0]) {
		case "admin":
			if(args[1]) {
				if(!chatroom) return "No chatroom with this name exists.";
				if(chatroom.admin !== spl.id) return "You are not the administrator of this chatroom.";
				switch(args[2]) {
					case "setpass":
						if(!args[3]) return "Provide a new password."

						chatroom.password = args[3];

						game.db.set("chats", chatroom.id, chatroom);

						game.chats.send(chatroom, spl.id, "¬gNew password set.¬*");

						return "Password set.";
					case "users":
						return `Users:
${chatroom.users.map(u=>`¬${u==chatroom.admin?"r":"b"}${u}¬*`).join("\n")}`
					case "kick":
						if(!args[3]) return "Who do you want to kick?";
						if(!chatroom.users.includes(args[3])) return "That user is not in this chatroom.";

						chatroom.users.splice(chatroom.users.indexOf(args[3]), 1);

						game.chats.send(chatroom, args[3], "¬gUser kicked.¬*");

						return "User kicked.";
					default:
						/* fallthrough out of switch */
				}
			}
			return `Usage: chats admin [channel] [command]
Commands:
 setpass
 users
 kick`;
		case "create":
			if (!args[1]) return "Usage: chats create [name] {pass}";
			if (args[1].length > 16) return "Chat name exceeds limit of 16 characters.";
			if (ur.test(args[1])) return "Invalid chat name.";

			if (chatroom) return "A chatroom with this name already exists.";

			if(!flags.includes("--confirm")) return `Confirm creating chatroom "${args[1]}"${args[2]?` with password "${args[2]}"`:""} using --confirm`;

			const chat = {
				id: args[1],
				password: args[2],
				admin: pl.id,
				users: [
					pl.id
				]
			}

			game.chats.send(chat, spl.id, "¬gUser joined chat.¬*");

			await game.db.set("chats", chat.id, chat);

			return "Chat created.";
		/*case "info":
			// TODO: here code insert Bubmet
		*/
		case "join":
			if (!args[1]) return "Usage: chats join [name] {pass}";
			if (!chatroom) return "No chatroom with this name exists.";

			if (chatroom.users.includes(spl.id)) return "You are already in this chatroom.";

			if (chatroom.password) {
				if(!args[2]) return "This chatroom requires a password to join.";
				if(args[2] !== chatroom.password) return "Incorrect password provided.";
			}

			chatroom.users.push(spl.id);

			await game.db.set("chats", chatroom.id, chatroom);

			game.chats.send(chatroom, spl.id, "¬gUser joined chat.¬*");

			return "Chat joined.";
		case "leave":
			if (!args[1]) return "Usage: chats leave [name]";
			if (!chatroom) return "No chatroom with this name exists.";

			if (!chatroom.users.includes(spl.id)) return "You are not in this chatroom.";

			chatroom.users.splice(chatroom.users.indexOf(spl.id), 1);

			await game.db.set("chats", chatroom.id, chatroom);

			game.chats.send(chatroom, spl.id, "¬gUser left chat.¬*");

			return "Left chat.";
		case "list":
			let chats = await game.db.filter({}, "chats");
			chats = chats.filter(c=>c.users.includes(spl.id));
			if(!chats.length) return "You are in no channels."
			return `You are in:
${chats.map(c=>`¬b${c.id}¬*`).join("\n")}`
		case "send":
			if (!args[1] && !args[2]) return "Usage: chats send [name] {msg...}";

			if (!chatroom) return "No chatroom with this name exists.";

			if (!chatroom.users.includes(spl.id)) return "You are not in this chatroom.";

			let msg = "¬g"+args.slice(2).join(" ")+"¬*";
			game.chats.send(chatroom, spl.id, msg);

			return "Sent.";
		default:
			return `Usage: chats [command]
Commands:
 admin
 create
 info
 join
 leave
 list
 send`
	}
})
