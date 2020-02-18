let sys = await game.db.get("systems", "ATOM_CRAWLR");
if (!sys) {
	console.log("Creating ATOM_CRAWLR");

	sys = await game.systems.create("ATOM_CRAWLR", {
		role: "ATOM_CRAWLR",
		ip: "10.001.000.011.110",
		bits: 313337,
		pass: game.lib.gen(16),
		port_count: 10,
		core_count: 6,
		hardware: {
			cpu: 75,
			ram: 128
		},
		software: [
			{
				name: "atom_trace",
				type: "trace",
				tier: 2,
				installed: true,
				permanent: true
			},
			{
				name: "atom_blarg",
				type: "blarg",
				tier: 3,
				installed: true,
				permanent: true
			},
			{
				name: "atom_pesticide",
				type: "antivirus",
				tier: 2,
				installed: true,
				permanent: true
			}
		],
		fs:{
			logs:{
				"log.log":"Target breached\nScanning processes\nProcess 'remote:blale' paused for 1m.00\nProcess 'remote:rocket' paused for 1m.00\nProcess 'remote:alice_migrate' paused for 1m.00\nScanning filesystem\nIdentified target software\nMerging 'local:upd_ai_uprise' with 'remote:hive_ai_proto'\nDeploying firmware update\nDisconnecting"
			}
		},
		fs_locked: true
	});
}

game.ai.create_logic("CRAWLR-LOGIC", 5000, async(l)=>{
	sys = await game.db.get("systems", "ATOM_CRAWLR");

	let upd = false;

	if (!game.systems.software.active(sys, "antivirus")) {
		sys.software.push({
			name: "atom_pesticide",
			type: "antivirus",
			tier: 2,
			installed: true,
			permanent: true
		});
		upd = true;
	}

	if (sys.software.find(sw=>sw.malware)) {
		console.log("Triggered security measures on CRAWLR.");

		await game.systems.broadcast(sys, `¬RSystem compromised!¬*`);
		sys.pass = game.lib.gen(16);
		await _runcmd("antivirus", [], [], undefined, sys);

		await game.systems.broadcast(sys, `¬RSecurity measures triggered.¬*`);
		let pls = await game.db.filter({connected_to:sys.ip}, "players");
		pls.forEach(async pl=>{
			pl.connected_to = pl.main_system;
			game.clients.filter(c=>c.player==pl.id).forEach(c=>c.send({
				event: "broadcast",
				msg: "Connection Terminated"
			}));
			await game.db.set("players", pl.id, pl);
		});
	}

	const breaches = sys.ports.filter(p=>game.systems.ports.is_breached(p));
	const bi = breaches.map(b=>sys.ports.indexOf(b));

	if (bi.length && !(game.jobs[sys.id] && game.jobs[sys.id].find(j=>j.name=="patch"))) {
		await game.systems.broadcast(sys, `¬R${breaches.length} breach${breaches.length==1?"":"es"}¬*`);

		const p = bi[0];
		await game.systems.broadcast(sys, `¬RPatching port ${p}¬*`);
		await game.systems.broadcast(sys, await _runcmd("ports", [p.toString()], ["--patch"], undefined, sys));
	}

	let intruders = await game.db.filter({connected_to:sys.ip}, "players");
	intruders = intruders.filter(p=>!p.trace);
	if (intruders.length && !(game.jobs[sys.id] && game.jobs[sys.id].find(j=>j.name=="trace"))) {
		game.systems.broadcast(sys, `¬R${intruders.length} intruder${intruders.length==1?"":"s"}¬*`);

		const p = intruders[0].id;
		await game.systems.broadcast(sys, `¬RTracing ${p}¬*`);
		await game.systems.broadcast(sys, await _runcmd("trace", [p], [], {id:null}, sys));
	}

	if (upd)
		await game.db.set("systems", sys.id, sys);
});