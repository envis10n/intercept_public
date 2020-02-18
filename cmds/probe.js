(async(pl, sys, args, flags)=>{
	if (!game.systems.software.active(sys, "probe"))
		return `Execution failed: Missing software.`;

	let target;
	if (args[0]) target = (await game.db.filter({ip:args[0]}, "systems"))[0];

	if (args[0] && target) {
		if (target.ports.length == 0) {
			return "¬rNo ports. Unanimous access granted.¬*";
		}

		if (args[1] && target.ports[args[1]]) {
			let tc = [];
			for (let i = 2; i<args.length; i++)
				tc.push(args[i]);
				if (tc.length > 6) return "Error: Cannot probe more than 6 nodes at a time.";

			const r = [];

			if (game.systems.ports.is_breached(target.ports[args[1]]))
				r.push("¬rPort is breached.¬*");

			if (game.systems.ports.is_patching(target.ports[args[1]], target))
				r.push("¬rPort is being patched.¬*");

			if (r.length) r.push("");

			r.push(game.systems.ports.render_attacker(target.ports[args[1]], 6, 8, tc));
			
			return r.join("\n");
		} else {
			let r = [];
			r.push(`[${target.ip}]`);
			if (target.greet) r.push(`'${target.greet}'`);
			r.push("", "[Ports]");
			for (let i = 0; i<target.ports.length; i++) {
				const p = target.ports[i];
				r.push(`Port ${i}: ¬${game.systems.ports.is_breached(p)?"rBreached":"gSecure"}¬*`);
			}
			return r.join("\n");
		}
	} else if (args[0]) return `probe: ${args[0]}: Name or service not known`;

	return "Usage: probe [ip] {port} {nodes...}"
})
