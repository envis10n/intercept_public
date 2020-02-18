let locks = [
	"rs_colv",
	"rs_n",
	"rs_f"
].map(l=>{
	return {
		name: l,
		type: l,
		installed: true,
		tier: 1
	};
});
locks = [
	...locks,
	...[
		"ss_colv",
		"ss_n",
		"ss_f"
	].map(l=>{
		return {
			name: l,
			type: l,
			installed: true,
			tier: 2
		}
	})
];

let main = await game.db.get("systems", "hive_bank_main");
if (!main) {
	main = await game.systems.create("hive_bank_main", {
		role: "hive_bank_main",
		bits: 500000,
		software: locks,
		port_count: 4,
		core_count: 2
	});
	await game.npcs.create("hive_bank", {
		npc: true,
		main_system: main.ip
	});
}

let nodes = await game.db.filter({role:"hive_bank_node"}, "systems")
for (let i = nodes.length; i<6; i++) {
	let node = await game.systems.create(undefined, {
		role: "hive_bank_node",
		bits: 0,
		software: locks,
		port_count: 4,
		core_count: 2,
		node: i
	});

	await game.npcs.create(`hive_bank_node${i}`, {
		npc: true,
		main_system: node.ip
	});
}


async function dumpAll(main, nodes) {
	await game.systems.broadcast(main, "All nodes dumping bits");
	for (const node of nodes) {
		await game.systems.broadcast(node, "Dumping bits to main system");
		await _runcmd("bits", ["transfer", "hive_bank", node.bits], [], await game.db.get("players", `hive_bank_node${node.node}`), node);
	}
}

async function distribute(main, nodes) {
	await game.systems.broadcast(main, "Distributing bits");
	let amt = Math.floor(main.bits/nodes.length);
	for (const node of nodes) {
		await _runcmd("bits", ["transfer", `hive_bank_node${node.node}`, amt], [], await game.db.get("players", `hive_bank`), main);
	}
}

let dist = 1;
let breaches = [];
game.ai.create_logic(undefined, 2500, async(l)=>{
	let reqs = await game.db.filter({type:"hive_bank_req"}, "game");
	if (reqs.length && dist == 0) dist = 1;

	main = await game.db.get("systems", "hive_bank_main");
	nodes = await game.db.filter({role:"hive_bank_node"}, "systems");

	for (const node of nodes) {
		const breached = node.ports.filter(p=>game.systems.ports.is_breached(p));
		if (breached.length) {
			if (!breaches.includes(node.node)) {
				await game.systems.broadcast(main, `Breach reported by node ${node.node}`);
				if (!dist) dist = 1;
				breaches.push(node.node);
			}

			if (!(game.jobs[node.id] && game.jobs[node.id].find(j=>j.name=="patch")))
				await _runcmd("ports", [node.ports.indexOf(breached[0])], ["--patch"], await game.db.get("players", `hive_bank_node${node.node}`), node);
		} else if (breaches.includes(node.node)) {
			breaches.splice(breaches.indexOf(node.node), 1);
			await game.systems.broadcast(main, `Node ${node.node} is no longer breached`);
			if (!dist) dist = 1;
		}
	}

	if (dist == 1) {
		await dumpAll(main, nodes);
		dist = 0.5;
	} else if (dist == 0.5) {
		if (reqs.length) {
			for (const req of reqs) {
				await _runcmd("bits", ["transfer", req.user, req.bits], [], await game.db.get("players", "hive_bank"), main);
				await game.db.delete("game", req.id);
			}
		}

		await distribute(main, nodes.filter(node=>!breaches.includes(node.node)));
		dist = 0;
	}
});