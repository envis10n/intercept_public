(async(pl, sys, args, flags)=>{
	if (sys.id == "0.0.0.0" || sys.fs_locked || sys.type == "honeypot") {
		return "¬RSystem administrator has disallowed remote connections.¬*";
	}

	let target;
	if (args[0]) target = (await game.db.filter({ip:args[0]}, "systems")).pop();

	if (target) {
		if (args[0] == sys.ip)
			if (sys.ip == pl.main_system)
				return "You can't connect to your own system."
			else
				return "Use exit to return to your own system.";
		if (args[1] || !target.pass) {
			if (target.pass == args[1] || !target.pass) {
				pl.last_connection = pl.connected_to;
				pl.connected_to = target.ip;

				game.clients.filter(c=>c.player==pl.id).forEach(c=>c.send({
					event:"connected",
					player:{
						ip: pl.main_system,
						conn: pl.connected_to
					}
				}));

				await game.db.set("players", pl.id, pl);

				if (game.systems.software.active(target, "springtrap") && target.id != "0.0.0.0" /*hotfix*/) {
					const sw = target.software.find(sw=>sw.type=="springtrap");
					sw.installed = false;

					game.systems.jobs.create(target, "<anonymous-job>", async()=>{
						return `¬rDetected connection from ${pl.id} (${pl.main_system})¬*`;
					}, 5000);
				}

				if (target.type == "honeypot")
					target.logs.push(`${pl.main_system} connected`);

				await game.db.set("systems", target.id, target);

				await game.systems.fs.add_log(sys, `${pl.last_connection} logged in to ${target.ip} as root`, "access.log");
				if (target.id == "0.0.0.0") {
					game.systems.broadcast(target, "¬Bzd_cbot1:¬* Hello. Take whatever you want using ¬gsoftware¬*.");
				} else
					await game.systems.fs.add_log(target, `${sys.ip} logged in as root`, "access.log");
				
				return `Connected to ${target.ip}`;
			} else return "Incorrect password";
		} else return "No password provided"
	} else if (args[0]) return `connect: ${args[0]}: Name or service not known`;

	return "Usage: connect [ip] [password]"
})