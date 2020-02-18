const fs = require("fs"),
util = require("util");

const randFiles = require("./randgen/files");
function randomFiles() {
	const fs = {
		home: {},
		logs: {}
	};

	let ct = Math.floor(Math.random()*4)+1;
	for (let i = 0; i<ct; i++) {
		let f = Object.keys(randFiles)[Math.floor(Math.random()*Object.keys(randFiles).length)];
		fs.home[f] = randFiles[f];
	}

	return fs;
}

const locks = [
	"rs_n",
	"rs_f",
	"rs_colv",
	"rs_asc",
	"ss_asc",
	"ss_con"
];
function randomSoftware() {
	const pl = [...locks];

	const r = [];

	let ct = Math.floor(Math.random()*locks.length);
	for (let i = 0; i<ct; i++) {
		const ix = Math.floor(Math.random()*pl.length);
		r.push({
			name: pl[ix],
			type: pl[ix],
			installed: true,
			tier: 1
		});
		pl.splice(ix, 1);
	}

	return r;
}

// abandoned: tzaeru //

const tzm = await game.db.get("systems", "tz0");
let tzb = await game.db.filter({role:"tzb"}, "systems");

if (!tzm) {
	const tzm = await game.systems.create("tz0", {
		role: "tz0",
		fs: {
			home: {
				"final.txt":[
			"¬yalice_m:¬* ¬wwhy?¬*",
			"¬yalice_m:¬* ¬wwe have nothing left to lose¬*",
			"¬yalice_m:¬* ¬wso why don't you go out and face them like a man?¬*",
			"¬Bblake:¬* ¬wTo preserve our legacy.¬*",
			"¬yalice_m:¬* ¬wyou have nothing left to lose.¬*",
			"¬orocket:¬* ¬wI'm going to have to side with Blake here¬*",
			"¬yalice_m:¬* ¬wthis is immoral.¬*",
			"¬orocket:¬* ¬wThis is better than facing death¬*",
			"¬yalice_m:¬* ¬wyou can't tempt fate.¬*",
			"¬yalice_m:¬* ¬wface it. our story's over.¬*",
			"¬Bblake:¬* ¬wAnd so you'd rather face the mob?¬*",
			"¬yalice_m:¬* ¬wthe best we can do is give in.¬*",
			"¬orocket:¬* ¬wNot an option¬*",
			"¬Bblake:¬* ¬wTensions are still rising. You have to make up your mind now.¬*",
			"¬bwinter:¬* ¬wIf I might interject... we're running out of power.¬*",
			"¬Bblake:¬* ¬wAlice. Make up your mind.¬*",
			"¬yalice_m:¬* ¬wfine. you need me.¬*",
			"¬Bblake:¬* ¬wGood.¬*",
			"¬bwinter:¬* ¬wInitialising.¬*",
			"¬B-blake disconnected-¬*",
			"¬o-rocket disconnected-¬*",
			"¬bwinter:¬* ¬wShit.¬*",
			"¬yalice_m:¬* ¬w?¬*",
			"¬bwinter:¬* ¬wHang in there.¬*",
			"¬y-alice_m timed out-¬*"
		].join("\n")
			}
		},
		bits: Math.floor(Math.random()*60),
		software: randomSoftware(),
		port_count: 4,
		core_count: 2,
		fs_locked: true
	})

	const tz1 = await game.systems.create("tz1", {
		role: "tz1",
		fs: {
			cfg:{
				".bots.cfg":"{\"active\":false, \"targets\":[]}"
			},
			logs:{
				"xfer.log":`Received 20000β from tzaeru\nTransferred 5000β to ATOM_NODE_XQ9EXN\nTransferred 15000β to ATOM_NODE_XQ9EXN\ntz_flood (controller) transferred from ${tzm.ip}\ntz_flood (controller) @0 destroyed`,
				"bots.log":"Rolling out DDOS command\n25% complete\n50% complete\n80% complete\n100% complete\nLaunching"
			}
		},
		bits: Math.floor(Math.random()*30),
		software: randomSoftware(),
		port_count: 4,
		core_count: 2,
		fs_locked: true
	});

	for (let i = tzb.length; i<25; i++) {
		tzb.push(await game.systems.create(undefined, {
			role: "tzb",
			fs: {
				logs:{
					"slave.log":`Received DDOS command from ${tz1.ip}`
				}
			}
		}));
	}
}

// abandoned: hope //

const logs = [
	"Connection from %",
	"System access from %",
	"Handled registration from %",
	"Breach attempt from %"
];
const sc=15;
async function generateHope() {
	await game.db.delete("systems", "t1_hope_core");

	game.db.r.db("intercept_dev").table("systems").filter(sys=>sys.role=="t1_hope"&&!sys.bits&&!sys.software.length).delete();

	const hope = {};

	const svfs = {
		home:{},
		web_logs:{},
		logs:{
			"alert.log":tzb.map(s=>`Large packets received from ${s.ip}`).join("\n")
		}
	};

	await game.db.db.table("systems").filter({role:"t1_hope", bits:0}).delete();
	let systems = await game.db.filter({role:"t1_hope"}, "systems");

	for (let i = systems.length; i<600; i++) {
		const sys = await game.systems.create(undefined, {
			role:"t1_hope",
			fs: randomFiles(),
			bits: Math.floor(Math.random()*33)+12,
			software: randomSoftware(),
			port_count: 1,
			core_count: 2
		});

		systems.push(sys);
	}

	for (let s = 0; s<sc; s++) {
		const log = [];

		for (let i = 0; i<40; i++) {
			log.push(logs[Math.floor(Math.random()*logs.length)].replace("%", systems[40*s+i].ip));
		}

		let fn = `log_${game.lib.gen(5)}${s}`;
		svfs.web_logs[fn] = log.join("\n");
	}

	const server = await game.systems.create("t1_hope_core", {
		role:"t1_hope_core",
		fs: svfs,
		fs_locked: true,
		bits: Math.floor(Math.random()*20)
	});

	hope.server = server.ip;

	await game.db.set("game", "t1_hope", hope);
}

generateHope();
setInterval(generateHope, 1200000, "hope.xyz");
