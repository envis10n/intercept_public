const npcs = {};

npcs.gen_name = ()=>{
	const wl = game.dict.combined;
	return `${wl[Math.floor(Math.random()*wl.length)]}${Math.floor(Math.random()*257)}`;
}
npcs.gen_unique_name = async ()=>{
	while (true) {
		const name = npcs.gen_name();
		const df = await game.db.get("players", name);
		if (!df) return name;
	}
}

npcs.create = async (name, md={}, sys)=>{
	const p = {};

	p.id = name;

	p.npc = true;

	for (const prop in md)
		p[prop] = md[prop];

	if (!p.id) p.id = await npcs.gen_unique_name();

	if (sys == undefined && p.main_system == undefined) {
		sys = await game.systems.create();

		sys.software = [
			{
				name: "atom_probe",
				type: "probe",
				tier: 1,
				installed: true
			},
			{
				name: "zd_infltr8tr",
				type: "breach",
				tier: 1,
				installed: true
			},
			{
				name: "void_pw",
				type: "getpw",
				tier: 1,
				installed: true
			}
		];

		if (md.ip) {
			sys.ip = md.ip;
			delete p.ip;
		}
		if (md.bits) {
			sys.bits = md.bits;
			delete p.bits;
		}
		if (md.software) {
			sys.software = [...sys.software, ...md.software];
			delete p.software;
		}
		if (md.hardware) {
			sys.hardware = md.hardware;
			delete p.hardware;
		}
	}
	if (sys) {
		p.main_system = sys.ip;
		p.connected_to = sys.ip;
		p.last_connection = sys.ip;
	}

	await game.db.set("players", p.id, p);

	return p;
}

module.exports = exports = npcs;