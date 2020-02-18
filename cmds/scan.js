(async(pl, sys, args, flags)=>{
	const r = {
		connected:[],
		connections:[],
		adjacent:sys.adjacent?sys.adjacent.map(async id=>{
			const s = await game.db.get("systems", id);
			return s.ip;
		}):[]
	};

	const sysOwner = (await game.db.filter({main_system:sys.ip}, "players")).pop();

	if (sysOwner && sysOwner.connected_to !== sysOwner.main_system)
		r.connected.push(sysOwner.connected_to);

	if (sys.type == "honeypot") {
		const hpOwner = await game.db.get("systems", sys.loyalty);
		r.connected.push(hpOwner.ip);
	}

	const conns = await game.db.filter({connected_to:sys.ip}, "players");
	r.connections = conns.filter(c=>sysOwner?c.id!=sysOwner.id:true).map(c=>c.trace?c.main_system:c.id);

	const ret = [];
	ret.push(`${r.connected.length} outbound connection${r.connected.length==1?"":"s"}`);
	if (r.connected.length) ret.push(...r.connected);

	ret.push("", `${r.connections.length} inbound connection${r.connections.length==1?"":"s"}`);
	if (r.connections.length) ret.push(...r.connections);

	ret.push("", `${r.adjacent.length} adjacent system${r.adjacent.length==1?"":"s"}`)
	if (r.adjacent.length) ret.push(...r.adjacent);

	return ret.join("\n");
})
