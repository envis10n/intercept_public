(async(pl, sys, args, flags)=>{
	if (!game.systems.software.active(sys, "honeypot"))
		return "Execution failed: Missing software.";

	let hp = await game.db.filter({
		type: "honeypot",
		loyalty: sys.id
	}, "systems");

	if (hp.length) {
		hp = hp.pop();
		if (args[0] == "clear") {
			hp.logs = [];
			await game.db.set("systems", hp.id, hp);
		}
		return [
			"¬bSpecs:¬*",
			await _.runcmd("specs", [], [], pl, hp),,

			"¬bPassword:¬*",
			await _.runcmd("pass", ["see"], [], pl, hp),,

			"¬bPorts:¬*",
			await _.runcmd("ports", [], [], pl, hp),,

			"¬bLogs:¬*",
			"¬Bclear¬*",
			`${hp.logs.length} logs`,
			...hp.logs
		].join("\n");
	}

	if (args[0] != "confirm")
		return "¬bConfirm creation of honeypot for 500β by passing \"confirm\"¬*";
	if (sys.bits < 500)
		return "¬bNot enough bits to create honeypot.¬*";
	sys.bits -= 500;

	await game.db.set("systems", sys.id, sys);

	hp = await game.systems.create(`${sys.id}_HONEYPOT`, {
		type: "honeypot",
		loyalty: sys.id,
		logs: []
	});

	return `¬bCreated honeypot system with ip ${hp.ip}¬*`;
})