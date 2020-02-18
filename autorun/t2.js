const locks = [
	{
		name: "rs_asc",
		type: "rs_asc",
		tier: 1
	},
	{
		name: "ss_asc",
		type: "ss_asc",
		tier: 2
	},
	{
		name: "ss_con",
		type: "ss_con",
		tier: 2
	},
	{
		name: "ss_colv",
		type: "ss_colv",
		tier: 2
	},
	{
		name: "ss_n",
		type: "ss_n",
		tier: 2
	},
	{
		name: "ss_f",
		type: "ss_f",
		tier: 2
	},
	{
		name: "gs_rep",
		type: "gs_rep",
		tier: 3
	}
];
const software = [
	{
		name: "defender",
		type: "antivirus",
		tier: 2
	},
	{
		name: "wb_trace_r",
		type: "trace",
		tier: 2
	},
	{
		name: "TZ_INFECT",
		type: "malgen",
		tier: 2
	},
	{
		name: "void_springtrap",
		type: "springtrap",
		tier: 2
	},
	{
		name: "WT_honeypot",
		type: "honeypot",
		tier: 3
	}
];
function randomSoftware() {
	let pl = [...locks];

	const r = [];

	let ct = Math.floor(Math.random()*locks.length)+1;
	for (let i = 0; i<ct; i++) {
		const ix = Math.floor(Math.random()*pl.length);
		const sw = pl[ix];
		sw.installed = true;
		r.push(sw);
		pl.splice(ix, 1);
	}

	pl = [...software];

	const sct = Math.max(Math.floor(Math.random()*(software.length+1))-1, 0);
	for (let i = 0; i<sct; i++) {
		const ix = Math.floor(Math.random()*pl.length);
		const sw = pl[ix];
		pl.installed = Math.random()<=0.5;
		r.push(sw);
		pl.splice(ix, 1);
	}

	return r;
}

// abandoned: loststar //

const lspw = [
	"admin",
	"password",
	"root",
	"letmein",
	"love",
	"secret",
	"sex",
	"god",
	"qwerty"
];

async function generateLostStar(sc=5) {
	const loststar = {};

	let systems = await game.db.filter({role:"t2_loststar"}, "systems");

	for (const sys of systems) {
		if (!sys.bits && !sys.software.length) {
			await game.db.delete("systems", sys.id);
			continue;
		}
		if (sys.bits < 150) {
			sys.bits += Math.floor(Math.random()*(151-sys.bits));
			await game.db.set("systems", sys.id, sys);
		}
	}

	for (let i = systems.length; i<50; i++) {
		systems.push(await game.systems.create(undefined, {
			role: "t2_loststar",
			software: randomSoftware(),
			bits: Math.floor(Math.random()*75)+75,
			core_count: 2
		}));
	}

	const server = await game.systems.create(undefined, {
		role:"t2_loststar_core",
		software: randomSoftware(),
		fs: {
			cfg:{
				"server.cfg":JSON.stringify({
					proxy: "255.255.255.255",
					database: "knights_quest_online",
					token: "T2ZaL0s9t5G1r1l",
					tables:[
						"players",
						"guilds",
						"buildings",
						"items",
						"locations",
						"npcs"
					],
					threshold:1000000000,
					users_per_shard:100000,
					employees:systems.map(sys=>sys.ip)
				})
			},
			logs:{
				"crash.log":"Segmentation fault"
			}
		},
		bits: Math.floor(Math.random()*120),
		core_count: 2,
		port_count: 3,
		fs_locked: true
	});

	loststar.server = server.ip;
	loststar.password = lspw[Math.floor(Math.random()*lspw.length)];

	await game.db.set("game", "t2_loststar", loststar);
}

generateLostStar();
setInterval(generateLostStar, 1800000, "LostStar");
