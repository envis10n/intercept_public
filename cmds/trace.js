(async(pl, sys, args, flags)=>{
	if (!game.systems.software.active(sys, "trace"))
		return `Execution failed: Missing software.`;
	if(!args[0]) return "Usage: trace [name]"
	let target = await game.db.get("players", args[0])
	if(!target) return `trace: ${args[0]}: No such connection.`

	if (target.id == pl.id)
		return `trace: ${args[0]}: You cannot trace yourself.`;
	if(target.connected_to !== sys.ip) return `trace: ${args[0]}: No such connection.`

	if(sys.id === "0.0.0.0") {
		await game.systems.broadcast(sys, "¬Bzd_cbot1:¬* ¬gtrace¬* execution is ¬Rnot permitted¬* on this system.");
		return "";
	}

	if (game.jobs[sys.id] && game.jobs[sys.id].find(j=>j.name=="trace"))
		return "trace: A trace is already active."

	if (game.jobs[sys.id] && game.jobs[sys.id].length >= sys.hardware.ram)
		return "Could not allocate memory for this job."

	game.clients.filter(c=>c.player==target.id).forEach(c=>c.send({
		event: "traceStart",
		system: sys.ip,
		panic: true,
		msg:`¬y[¬*¬oWARN¬*¬y]¬* ¬yTrace from ${sys.ip} inbound.¬*`
	}));

	game.systems.jobs.create(sys, "trace", async()=>{
		target = await game.db.get("players", args[0]);
		if(target.connected_to !== sys.ip) return `trace: Target ${target.ip} has disconnected from this system.`
		target.trace = true;
		await game.db.set("players", target.id, target);
		game.clients.filter(c=>c.player==target.id).forEach(c=>c.send({
			event: "traceComplete",
			system: sys.ip,
			panicEnd: true,
			msg:`¬y[¬*¬oWARN¬*¬y]¬* ¬yTrace from ${sys.ip} completed.¬*`
		}));
		return `trace: Successfully traced ${target.id} to ${target.main_system}`;
	}, 60000, {
		sys: sys.id,
		user: target.id,
		nokill: true
	});
	return "Attempting to trace connection.";
})
