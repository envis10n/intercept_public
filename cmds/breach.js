(async(pl, sys, args, flags)=>{
	if (!game.systems.software.active(sys, "breach"))
		return `Execution failed: Missing software.`;
	if(!args[0])
		return "Usage: breach [ip] [port] [node]"
	let target = (await game.db.filter({ip:args[0]}, "systems"))[0];
	if(!target)
		return `breach: ${args[0]}: Name or service not known`

	if (!args[1]) return "breach: No port specified";
	if (!args[2]) return "breach: No node specified";

	let port = target.ports[args[1]];
	if (!port)
		return `breach: ${args[0]}: ${args[1]}: Port is closed.`;
	if(!port.nodes.includes(args[2]))
		return `breach: ${args[0]}: ${getNodeSpec()}: Node not found.`
	if(!port.core_nodes.includes(args[2]))
		return `breach: ${args[0]}: ${getNodeSpec()}: Node is not a core node.`
	if(port.breached_cores.includes(args[2]))
		return `breach: ${args[0]}: ${getNodeSpec()}: Node is already breached.`

	if (game.jobs[sys.id] && game.jobs[sys.id].find(j=>j.name=="breach"))
		return "breach: There is already a breach in progress.";
	if (game.jobs[sys.id] && game.jobs[sys.id].length >= sys.hardware.ram)
		return "¬oCould not allocate memory for this job.¬*";

	let ret = ["¬RBreaching...¬*"]
	const lockNames = Object.keys(port.locks);
	if (lockNames.length > 0) {
		let arg = 3;
		for (const lock of lockNames) {
			let l = port.locks[lock];
			if (!l.armed) continue;
			if (l.lockfunc) {
				l = game.locks[lock](false, l, ret, args, arg);
				await game.db.set("systems", target.id, target)
			}
			if (l.ans && l.ans == args[arg]) {
				ret.push(`${lock}: ¬RDisarmed.¬*`);
				l.armed = false;
				await game.db.set("systems", target.id, target);
			} else {
				ret.push(`¬wActive lock detected.¬*`);
				ret.push(`${lock}: ¬R${args[arg]?"Incorrect":"Unauthorised"}¬*`);
				ret.push(l.msg);
				return ret.join("\n");
			}
			arg++;
		}
	}

	game.systems.jobs.create(sys, "breach", async()=>{
		target = (await game.db.filter({ip:args[0]}, "systems"))[0]

		if (!target) return "breach: Error: Target is no longer valid."; // fell off the net ?
		port = target.ports[args[1]];
		if (!port) return "breach: Error: Port was closed during operation.";

		if (!port.core_nodes.includes(args[2])) return `breach: Error: Node ${getNodeSpec()} stopped responding.`;
		if (port.breached_cores.includes(args[2])) return `breach: Error: Node ${getNodeSpec()} was breached from another source.`;

		const r = [];
		port.breached_cores.push(args[2]);
		r.push(`¬RBreached ${args[1]}x${args[2]} on ${args[0]}¬*`);

		if (game.systems.ports.is_breached(port))
			r.push(`¬RTarget port is now breached¬*`);
		if (game.systems.is_breached(target))
			r.push("¬RTarget system is now breached¬*");

		game.db.set("systems", target.id, target);

		return r.join("\n");
	}, Math.floor(5000+(1000/sys.hardware.cpu)));

	return ret.join("\n");

	function getNodeSpec() {
		return `${args[1]}x${args[2]}`
	}
})
