(async(pl, sys, args, flags)=>{
	if (sys.ports.length == 0)
		return "¬rNo ports found.¬*";

	if(!args[0]) {
		const quick = flags.includes("-q") || flags.includes("--quick"),
		r = [];
		if(!quick)
			r.push("[System]")

		const pb = sys.ports.filter(port => game.systems.ports.is_breached(port));
		if (pb.length) r.push(`¬R${pb.length}¬* ¬rbreach${pb.length==1?"":"es"} detected.¬*`, "");
		else r.push("¬gSystem optimal.¬*", "");

		if(!quick) {
			r.push("[Ports]");

			for (let i = 0; i<sys.ports.length; i++) {
				const p = sys.ports[i];
				r.push(`Port ${i}:`,
					`- ¬${game.systems.ports.is_breached(p) ? "rBreached" : "gSecure"}¬*`,
					`¬G- ${p.core_nodes.length} core node${p.core_nodes.length==1?"":"s"}¬*`,
					`¬G- ${p.nodes.length} node${p.nodes.length==1?"":"s"}¬*`
				);
			}
		}
		return r.join("\n");
	} else {
		const p = sys.ports[args[0]];
		if (!p) return `Error: Port ${args[0]} not found.`;

		if (flags.includes("--patch") || flags.includes("-p")) {
			if (game.jobs[sys.id] && game.jobs[sys.id].find(j=>j.name=="patch"))
				return "There is already a patch in progress.";
			if (game.jobs[sys.id] && game.jobs[sys.id].length >= sys.hardware.ram)
				return "Could not allocate memory for this job.";

			/*let time = 30000-100*sys.hardware.cpu;
			time += 2500*(sys.software.filter(sw=>sw.installed&&Object.keys(game.locks).includes(sw.type)).length+2);
			time += 600*((sys.core_count?sys.core_count:1)-1);*/

			let time = 30000-100*sys.hardware.cpu;

			time += 2500*sys.software.filter( sw => sw.installed &&
				Object.keys(game.locks).includes(sw.type)
			).length;

			time += 600*(sys.core_count?sys.core_count:1);

			game.systems.jobs.create(sys, "patch", async () => {
				sys = await game.db.get("systems", sys.id, sys);
				if (!sys) return;

				sys.ports[args[0]] = game.systems.ports.gen_port(48, sys.core_count?sys.core_count:1, sys);
				game.db.set("systems", sys.id, sys);
				return `Port ${args[0]} has been patched.`;
			}, time,{port:args[0]});
			return `Begun patching of port ${args[0]}.`
		} else if (flags.includes("--breach")) {
			p.breached_cores = [...p.core_nodes];
			await game.db.set("systems", sys.id, sys);
			return `Port ${args[0]} breached.`
		}

		const r = [],
		breached = game.systems.ports.is_breached(p),
		patching = game.systems.ports.is_patching(p, sys);
		if (breached)
			r.push("¬rPort is breached.¬*");

		if (patching) {
			r.push("¬wPort is being patched.¬*");
		}
		if (breached && !patching) {
			r.push("¬wUse --patch (-p) to apply a patch to this port.¬*");
		}

		r.push(game.systems.ports.render(p));

		return r.join("\n");
	}
})
