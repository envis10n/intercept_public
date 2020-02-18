(async(pl, sys, args, flags)=>{
	const ur = /[^_a-zA-Z0-9]/;

	let spl = await game.db.filter({main_system:sys.ip}, "players");
	if (!spl.length) spl = pl;
	else spl = spl.pop();

	if (args[0] == "admin") {
		let usage = `Usage: chats admin [command]
Commands:
 setpass
 users
 kick`;
		if (!args[1]) return usage;

		const ce = await game.db.get("chats", args[1]);
		if (!ce)
			return "No chatroom with this name exists.";
		if (ce.admin != spl.id)
			return "You are not the administrator of this chatroom.";

		if (args[2] == "setpass") {
			if (!args[3]) return "Provide new password.";

			ce.password = args[3];

			await game.db.set("chats", ce.id, ce);
			
			game.chats.send(ce, spl.id, "¬gNew password set.¬*");

			return "Password set.";
		}

		if (args[2] == "users") {
			return `Users:
${ce.users.map(u=>`¬${u==ce.admin?"r":"b"}${u}¬*`).join("\n")}`
		}

		if (args[2] == "kick") {
			if (!args[3]) return "Who do you want to kick?";

			if (!ce.users.includes(args[3]))
				return "That user is not in this chatroom.";

			ce.users.splice(ce.users.indexOf(args[3]), 1);

			await game.db.set("chats", ce.id, ce);

			game.chats.send(ce, args[3], "¬gUser kicked.¬*");

			return "User kicked.";
		}

		return usage;
	}

	if (args[0] == "create") {
		if (!args[1]) return "Usage: chats create [name] {pass}";

		if (args[1].length > 16)
			return "Chat name exceeds limit of 16 characters.";
		if (ur.test(args[1]))
			return "Invalid chat name.";

		const ce = await game.db.get("chats", args[1]);
		if (ce)
			return "A chatroom with this name already exists.";

		if (flags.includes("--confirm")) {
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
		}

		return `Confirm creating chatroom "${args[1]}"${args[2]?` with password "${args[2]}"`:""} using --confirm`;
	} 

	if (args[0] == "info") {
		
	}

	if (args[0] == "join") {
		if (!args[1]) return "Usage: chats join [name] {pass}";

		const ce = await game.db.get("chats", args[1]);
		if (!ce)
			return "No chatroom with this name exists.";

		if (ce.users.includes(spl.id))
			return "You are already in this chatroom.";

		if (ce.password) {
			if (args[2] == ce.password) {}
			else if (args[2]) return "Incorrect password provided.";
			else return "This chatroom requires a password to join.";
		}

		ce.users.push(spl.id);

		await game.db.set("chats", ce.id, ce);

		game.chats.send(ce, spl.id, "¬gUser joined chat.¬*");

		return "Chat joined.";
	}

	if (args[0] == "leave") {
		if (!args[1]) return "Usage: chats leave [name]";

		const ce = await game.db.get("chats", args[1]);
		if (!ce)
			return "No chatroom with this name exists.";

		if (!ce.users.includes(spl.id))
			return "You are not in this chat.";

		ce.users.splice(ce.users.indexOf(spl.id), 1);

		await game.db.set("chats", ce.id, ce);

		game.chats.send(ce, spl.id, "¬gUser left chat.¬*");

		return "Left chat.";
	}

	if (args[0] == "list") {
		let chats = await game.db.filter({}, "chats");
		chats = chats.filter(c=>c.users.includes(spl.id));

		return `You are in:
${chats.map(c=>`¬b${c.id}¬*`).join("\n")}`
	}

	if (args[0] == "send") {
		if (!args[1] && !args[2]) return "Usage: chats send [name] {msg...}";

		const ce = await game.db.get("chats", args[1]);
		if (!ce)
			return "No chatroom with this name exists.";
		
		if (!ce.users.includes(spl.id))
			return "You are not in this chatroom.";

		let msg = "¬g"+args.slice(2).join(" ")+"¬*";
		game.chats.send(ce, spl.id, msg);

		return "Sent";
	}

	return `Usage: chats [command]
Commands:
 admin
 create
 info
 join
 leave
 list
 send`
})