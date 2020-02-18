// Modules //

const uuid = require("short-uuid")();

// Systems //

const systems = {};

systems.generate_ip = ()=>{
	let r = [];
	for (let i = 0; i<4; i++) r.push(Math.floor(Math.random()*255)+1)
	return r.join(".");
}

systems.generate_unique_ip = async ()=>{
	let ret = systems.generate_ip();

	while ((await game.db.filter({ip:ret}, "systems")).length)
		ret = systems.generate_ip();

	return ret;
}

systems.create = async (id=uuid.new(), info={})=>{
	const sys = {};

	sys.id = id;

	for (let k in info)
		sys[k] = info[k];

	if (sys.ip == undefined) sys.ip = await systems.generate_unique_ip();
	if (sys.fs == undefined) sys.fs = {
		home:{},
		logs:{}
	};
	if (sys.bits == undefined) sys.bits = 0;

	if (sys.pass == undefined) sys.pass = game.lib.gen(6);

	if (sys.software == undefined) sys.software = [];

	if (sys.port_count == undefined) sys.port_count = 2;
	if (sys.core_count == undefined) sys.core_count = 1;

	if (sys.ports == undefined) sys.ports = systems.ports.gen(sys.port_count, sys.core_count, sys);

	if (sys.hardware == undefined) sys.hardware = {
		cpu: 1,
		ram: 2
	};

	await game.db.set("systems", sys.id, sys);

	return sys;
}

systems.get_connected_players = async sys=>{
	return await game.db.filter({connected_to:sys.ip}, "players");
}

systems.get_connected_systems = async sys=>{
	const r = [];

	const plrs = systems.get_connected_players(sys);
	plrs.forEach(p=>r.push(p.last_connection));

	return r;
}

systems.broadcast = async (sys, ...msg)=>{
	const plrs = await systems.get_connected_players(sys);
	plrs.forEach(p=>game.clients.filter(c=>c.player==p.id).forEach(c=>c.send({
		event: "broadcast",
		msg: msg.join("\n")
	})));
}

systems.is_breached = (sys)=>{
	for (const port of sys.ports)
		if (!systems.ports.is_breached(port)) return false;
	return true;
}

systems.drop_connections = async (sys)=>{
	const pls = await systems.get_connected_players(sys);

	systems.broadcast(sys, "¬rConnection Reset¬*");

	for (const p of pls) {
		p.connected_to = p.main_system;
		p.last_connection = p.main_system;

		game.clients.filter(c=>c.player==p.id).forEach(c=>c.send({
			event:"connected",
			player:{
				ip: p.main_system,
				conn: p.connected_to
			}
		}));

		game.db.set("players", p.id, p);
	}
}

// Filesystem //

systems.fs = {};

systems.fs.parse = (fs, q)=>{
	const r = {
		query:q,
		dir:false,
		name:false,
		file:false,
		content:null,
		valid:false
	};

	while(q.startsWith("/"))
		q = q.slice(1);
	while(q.endsWith("/"))
		q = q.slice(0, -1);

	const tk = q.split("/");

	if (tk.length == 0 || tk[0] == "") {
		r.dir = "/";
		r.name = "";
		r.content = fs;
		r.valid = true;
	} else if (fs[tk[0]]) {
		r.dir = tk[0];
		r.name = tk[1];
		r.valid = true;
		if (tk.length == 2)
			if (tk[1] in fs[tk[0]]) {
				r.valid = true;
				r.file = fs[tk[0]][tk[1]];
				r.content = r.file.content;
			} else
				r.valid = false;
		else
			r.content = fs[tk[0]];   
	}

	return r;
}

systems.fs.add_log = async (sys, log, file="ukn.log")=>{
	if (sys.fs_locked) return null;

	if (!Object.keys(sys.fs).includes("logs"))
		sys.fs.logs = {};
	if (!Object.keys(sys.fs.logs).includes(file))
		sys.fs.logs[file] = {content:""};

	if (sys.fs.logs[file].content) sys.fs.logs[file].content += "\n";
	sys.fs.logs[file].content += log;

	await game.db.set("systems", sys.id, sys);
}

// Ports //

systems.ports = {};

systems.ports.gen = (pc=2, cc=1, sys)=>{
	const ports = [];

	for (let i = 0; i<pc; i++)
		ports.push(systems.ports.gen_port(48, cc, sys));

	return ports;
}

systems.ports.gen_port = (c=48, m=1, sys)=>{
	const port = {};

	port.core_nodes = [];
	port.nodes = [];

	port.breached_cores = [];

	port.locks = {};
	if (sys) {
		for (const lock of sys.software.filter(s=>s.installed)) {
			// Tier 1 //
			if (lock.type == "rs_n") port.locks.rs_n = game.locks.rs_n();
			if (lock.type == "rs_f") port.locks.rs_f = game.locks.rs_f();
			if (lock.type == "rs_asc") port.locks.rs_asc = game.locks.rs_asc();

			if (lock.type == "rs_colv") port.locks.rs_colv = game.locks.rs_colv();
			if (lock.type == "ss_con") port.locks.ss_con = game.locks.ss_con(6);
			if (lock.type == "ss_asc") port.locks.ss_asc = game.locks.ss_asc();

			// Tier 2 //
			if (lock.type == "ss_n") port.locks.ss_n = game.locks.ss_n();
			if (lock.type == "ss_f") port.locks.ss_f = game.locks.ss_f();
			if (lock.type == "ss_colv") port.locks.ss_colv = game.locks.ss_colv();
			if (lock.type == "ss_m") port.locks.ss_m = game.locks.ss_m();

			// Tier 3 //
			if (lock.type == "blarg" || lock.type == "atom_blarg") port.blargify = true;
			if (lock.type == "gs_m") port.locks.gs_m = game.locks.gs_m();
			if (lock.type == "gs_rep") port.locks.gs_rep = game.locks.gs_rep();

			if (port.locks[lock.type])
				port.locks[lock.type].armed = true;
		}
	}

	for (let i = 0; i<c; i++) {
		let id = game.lib.gen_hex();
		while (port.nodes.includes(id))
			id = game.lib.gen_hex();
		port.nodes.push(id);
	}

	let sel = [...port.nodes];
	for (let i = 0; i<m; i++) {
		let ix = Math.floor(Math.random()*sel.length);
		port.core_nodes.push(sel[ix]);
		sel.splice(ix, 1);
	}

	return port;
};

systems.ports.col = (port, n)=>{
	let ret = "R";

	const ni = port.nodes.indexOf(n);

	for (const c of port.core_nodes) {
		const ci = port.nodes.indexOf(c);

		if (ni == ci) return "G";

		if (
			port.blargify
			|| ni-6==ci // top
			|| ni+6==ci // bottom
			|| Math.floor(ni/6) != ni/6 && ni-1==ci // left
			|| Math.floor((ni+1)/6) != (ni+1)/6 && ni+1 == ci // right
		) ret = "y";
	}

	return ret;
}

systems.ports.render = (port, c=6, r=8)=>{
	const ll = 1+c*5;

	let s = "";

	const locks = port.locks;
	for (const lock in locks) {
		s += `¬${port.locks[lock].armed?"G":"R"}${lock}`;
		if (port.locks[lock].ans) {
			s += `: ${port.locks[lock].ans}`;
		}
		s += "¬*\n";
	}

	if (!port.nodes.length)
		return s+"\n¬rNo nodes. Patch required.¬*";

	s += "\n¬g"

	let i = 0;
	for (let y = 0; y<r; y++) {
		for (let x = 0; x<c; x++) {
			const n = port.nodes[i];

			let col = "";
			if (port.core_nodes.includes(n)) {
				if (port.breached_cores.includes(n)) col = "v";
				else col = "G";
			}

			if (col) s += `¬*¬${col}${n}¬*¬g `;
			else s += `${n} `;

			i++;
		}
		s += "¬*";
		if (y != r-1) s += "\n¬g";
	}
	s += "¬*";

	return s;
}

systems.ports.render_attacker = (port, c=6, r=8, tc=[])=>{
	const cold = {};
	for (const t of tc) {
		cold[t] = systems.ports.col(port, t);
	}

	const ll = 1+c*5;

	if (!port.nodes.length) 
		return "¬rNo nodes. Port breached.¬*";

	let s = "¬V";

	let i = 0;
	for (let y = 0; y<r; y++) {
		for (let x = 0; x<c; x++) {
			const n = port.nodes[i];

			let col = "";
			if (cold[n]) col = cold[n];
			if (port.breached_cores.includes(n)) col = "b";

			if (col) s += `¬*¬${col}${n}¬*¬V `;
			else s += `${n} `;

			i++;
		}
		s += "¬*";
		if (y != r-1) s += "\n¬V";
	}
	s += "¬*";

	return s;
}

systems.ports.is_breached = (port)=>{
	for (const n of port.core_nodes)
		if (!port.breached_cores.includes(n))
			return false;
	return true;
}

systems.ports.is_patching = (port, sys)=>{
	if (!Object.keys(game.jobs).includes(sys.id)) return false;

	const f = game.jobs[sys.id].find(j=>j.name=="patch");
	if (f && f.meta.port == sys.ports.indexOf(port)) return true;

	return false;
}

// Software //

systems.software = {};

systems.software.active = (sys, sw)=>{
	for (const s of sys.software)
		if (s.installed && s.type == sw) return s;

	return false;
}

// Hardware //

systems.hardware = {};

systems.hardware.CPUs = [
	"¬RANOMALY DETECTED¬*",
	"ATOM Gamma B1000",
	"ATOM Gamma B2000",
	"ATOM Gamma B3000",
	"ATOM Gamma B4000",
	"ATOM Gamma B5000",
	"ATOM Delta R1000",
	"ATOM Delta R2000",
	"ATOM Delta R3000",
	"ATOM Delta R4000",
	"ATOM Delta R5000",
	"ATOM Epsilon S1000",
	"ATOM Epsilon S2000",
	"ATOM Epsilon S3000",
	"ATOM Epsilon S4000",
	"ATOM Epsilon S5000",
	"ATOM Omega U1000"
];

// Jobs //

systems.jobs = {};

systems.jobs.create = (sys, name, f, ms, meta={})=>{
	if (!Object.keys(game.jobs).includes(sys.id)) game.jobs[sys.id] = [];

	const job = {};

	job.name = name;
	job.meta = meta;

	job.f = f;

	job.ms = ms;
	job.started = Date.now();
	job.finishes = job.started+ms;

	job.stop = ()=>game.jobs[sys.id].splice(game.jobs[sys.id].indexOf(job), 1);

	job.timeout = setTimeout(async ()=>{
		const jo = await f();
		systems.broadcast(sys, jo);

		job.stop();
	}, job.ms);

	game.jobs[sys.id].push(job);

	return job;
}

// Exports //

module.exports = exports = systems;
