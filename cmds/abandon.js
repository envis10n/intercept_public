(async (pl, sys, args, flags)=>{
	if (flags.includes("--confirm")) {
		if (pl.last_abandon) {
			if (Date.now()-pl.last_abandon<900000) {
				return `¬RError:¬* Cooldown required. ${Math.ceil((900000-(Date.now()-pl.last_abandon))/1000)}s remain.`;
			}
		}

		let r = [];

		let time = 60000;

		const breaches = sys.ports.filter(p=>game.systems.ports.is_breached(p));
		if (breaches.length) {
			time += 10000*breaches.length;
			r.push("¬RBreaches detected.¬* ¬rAttempting to avert...¬*");
		}
		r.push(`¬gMigration will take ${Math.floor(time/1000)}s.¬*`);

		game.systems.jobs.create(sys, "abandon", async ()=>{
			sys = await game.db.get("systems", sys.id);
			pl = await game.db.get("players", pl.id);

			r = [];

			const ns = await game.systems.create();

			r.push(`Connected to ${ns.ip}...`);
			r.push("Generating filesystem...");
			r.push("Updating...");

			pl.main_system = ns.ip;
			pl.connected_to = ns.ip;
			pl.last_connection = ns.ip;

			pl.last_abandon = Date.now();

			console.log(`${pl.id} relocated to ${ns.ip}`);

			r.push("Complete.");

			game.db.set("players", pl.id, pl);

			return r.join("\n");
		}, time, {
			nokill: true
		});

		return r.join("\n");
	}

	return `WARNING: This will completely abandon your current system.
You will be relocated to another system.

You will lose all of your current files, software and bits.

Add --confirm to confirm.`;
})