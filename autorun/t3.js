let keys = await game.db.get("game", "atom_keys");
if (!keys) keys = {keys:{}};

const types = ["t1_hope", "t2_loststar"];

async function genCode(type) {
	if (!type)
		type = types[Math.floor(Math.random()*types.length)];

	let pv = await game.db.filter({keyholder:type}, "systems");
	if (pv.length) {
		pv = pv.pop();
		if (pv.temp_lock) {
			pv.fs_locked = false;
			delete pv.temp_lock;
		}

		pv.role = pv.keyholder;
		delete pv.keyholder;

		if (pv.fs.ATOM && pv.fs.ATOM["ctrl.key"]) {
			console.log(`Obfuscating ${pv.ip}'s key`);
			pv.fs.ATOM["ctrl.key"].content = game.lib.explode(pv.fs.ATOM["ctrl.key"].content);
		}

		await game.db.set("systems", pv.id, pv);
	}

	const key = await game.lib.gen();

	const pl = await game.db.filter({role:type}, "systems");

	const sys = pl[Math.floor(Math.random()*pl.length)];

	if (!sys.fs_locked) {
		sys.temp_lock = true;
		sys.fs_locked = true;
	}

	sys.keyholder = type;
	sys.role = "keyholder";

	sys.fs.ATOM = {
		["ctrl.key"]:{content:key}
	};

	await game.db.set("systems", sys.id, sys);

	keys.keys[type] = key;
	await game.db.set("game", "atom_keys", keys);

	return key;
}

async function genAtom() {
	await game.db.delete("game", "atom_keys")
	keys = {keys:{}};

	for (const t of types) {
		const key = await genCode(t);
		console.log(`Generated key for ${t}: ${key}`);
	}

	const ips = [];

	let plrs = await game.db.filter({}, "players");
	plrs = plrs.filter(p=>!p.unique);

	for (const k in plrs) {
		const sys = await game.db.filter({ip:plrs[k].main_system}, "systems");
		if (!sys[0]) continue;
		plrs[k] = {p:plrs[k], sys:sys[0]};
	}

	plrs = plrs.filter(p=>p.sys.bits>100||p.sys.software.length>5||(p.p.npc)&&Math.random()<0.5).sort((a,b)=>b.sys.bits-a.sys.bits||b.sys.software.length-a.sys.software.length);

	console.log(`${plrs.length} players`);

	for (let i = 0; i<Math.min(plrs.length, 30); i++) {
		const x = Math.floor(Math.random()*plrs.length);
		ips.push(`${plrs[x].p.id} -> ${plrs[x].sys.id} -> ${plrs[x].sys.ip}`);
		plrs.splice(x, 1);
	}

	console.log(`${ips.length} ips`);

	await game.db.set("game", "atom_leaks", {ips})
}

genAtom();
setInterval(genAtom, 86400000);
setInterval(genCode, 43200000);