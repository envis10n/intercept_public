(async()=>{

// Modules //

const fs = require("fs"),
vm = require("vm"),
crypto = require("crypto"),
{slurp} = require("./async_helpers")

// Database //

const db = require("./db");
const cfg = require("./cfg");

await db.r.connect();

const dblist = await db.r.dbList();
if (!dblist.includes(cfg.db.name)) {
	await db.r.dbCreate(cfg.db.name);
	console.log("Created database");
}

db.db = db.r.db(cfg.db.name);

const tablelist = await db.db.tableList();
for (const t of cfg.db.tables) {
	if (!tablelist.includes(t)) {
		await db.db.tableCreate(t);
		console.log(`Created table: ${t}`);
	}
}

// Game object //

global.game = {
	chats: require("./chats"),
	ai: require("./ai"),
	cfg,
	clients: [],
	contracts: require("./contracts"),
	corps: require("./corps"),
	db,
	dict: {
		colours: require("./dict/colours").map(n=>n.toLowerCase()),
		names_alt: require("./dict/names_alt").map(n=>n.toLowerCase()),
		words: require("./dict/words").map(n=>n.toLowerCase())
	},
	jobs: {},
	lib: require("./lib"),
	locks: require("./locks"),
	malware: require("./malware"),
	npcs: require("./npcs"),
	rl: {}, lt: {},
	runFile: async function(file, ...args) {
		let src = await slurp(fs.createReadStream(file))
		return vm.runInNewContext(src, {game: this, _:{
			setTimeout,
			require,
			runcmd:_runcmd
		}})(...args)
	},
	systems: require("./systems"),
	tokens:{}
};
{
	game.dict.combined = [
		...game.dict.colours,
		...game.dict.names_alt,
		...game.dict.words,
	];
}

// Autorun //

async function exec_autorun() {
	if (game.timers) {
		console.log(`culling ${game.timers.length} timers`);
		for (const timer of game.timers) {
			clearInterval(timer);
		}
	}

	game.timers = [];

	const files = require("./autorun/files.json").files.map(f=>`${f}.js`);
	for (const f of files) {
		console.log(`Executing autorun file: ${f}`);

		let content;
		/* not touching this quite yet, sorry bub.
		-- Fayti1703 */
		try {
			content = await slurp(fs.createReadStream(`./autorun/${f}`))
		} catch(e) {
			console.error(e)
			continue
		}

		const _setInterval = setInterval;
		setInterval = (...args)=>{
			const t = _setInterval(...args);

			if (args[2]) {
				t.id = args[2];
			}

			game.timers.push(t);
		}
		await eval(`(async()=>{${content}})`)();
		setInterval = _setInterval;
	}

	console.log(`${game.timers.length} timers created during autorun`);
}

await exec_autorun();
game.exec_autorun = exec_autorun;

// Handler //

async function handle(client, data) {
	let id = client.id;
	if (client.player) id = client.player;

	if (!game.rl[id]) game.rl[id] = [];
	if (game.rl[id].length) {
		const crl = game.rl[id].filter(t=>Date.now()<t+500);
		if (crl.length > 5) {
			client.send({
				event: "drop",
				msg: "Spam detected. Client dropped."
			});
			client.drop();
			return;
		}

		game.rl[id] = game.rl[id].filter(t=>Date.now()<t+1500);
	}
	game.rl[id].push(Date.now());
	if (game.rl[id].length > 5) {
		client.send({
			error: "You are being ratelimited."
		});
		return;
	}

	if (!game.lt[id]) game.lt[id] = 0;

	try {
		data = data.constructor==Object?data:JSON.parse(data);

		{
			let dat = JSON.parse(JSON.stringify(data));
			if(dat.login)
				dat.login.password =    "[he redacc]"
			if(dat.register)
				dat.register.password = "[he redacc]"
			console.log(`${client.player?client.player:client.id} : ${JSON.stringify(dat)}`);
		}
		if (data.request == "ping") // Ping
			return client.send_metadata();
		else if (data.request == "auth") { // Authorization
			if (data.token) {
				if (typeof data.token != "string")
					return client.send({event:"auth", success:false});
				if (Object.values(game.tokens).includes(data.token)) {
					return client.send({
						event:"auth",
						success:true,
						username:Object.keys(game.tokens)[Object.values(game.tokens).indexOf(data.token)]
					});
				} else return client.send({event:"auth", success:false});
			} else {
				if (data.login) {
					const iv = game.lib.valid_login(data.login.username, data.login.password);
					iv.event = "auth";
					if (!iv.success) return client.send(iv);

					const pl = await game.db.get("players", data.login.username);
					if (!pl) return client.send({event:"auth", success:false, error:"User doesn't exist."});
					
					const hash = game.lib.gen_hash(data.login.password, pl.salt);

					if (game.lib.compare(hash, pl.pass)) {
						const token = game.lib.gen(24);
						game.tokens[data.login.username] = token;
						return client.send({
							event: "auth",
							success: true,
							token: token,
							cfg:pl.cfg
						});
					} else {
						return client.send({
							event: "auth",
							success: false,
							error:"Invalid password."
						});
					}
				} else if (data.register) {
					const iv = game.lib.valid_login(data.register.username, data.register.password);
					iv.event = "auth";
					if (!iv.success) return client.send(iv);

					const pl = await game.db.get("players", data.register.username);
					if (pl) return client.send({
						event: "auth",
						success: false,
						error:"User already exists"
					});

					console.log(`Processing registration for ${data.register.username}`);

					const salt = game.lib.gen(32);
					const hash = game.lib.gen_hash(data.register.password, salt);

					const token = game.lib.gen(24);

					game.tokens[data.register.username] = token;

					await game.db.set("players", data.register.username, {
						pass: hash,
						salt: salt,
						generated: false,
						cfg: {
							vol: 1
						}
					});

					console.log(`Registered ${data.register.username}`);

					return client.send({
						event: "auth",
						success: true,
						token: token,
						cfg: {
							vol: 1
						}
					});
				}
			}
		} else if (data.request == "connect") { // Connect
			if (data.token && Object.values(game.tokens).includes(data.token)) {
				const name = Object.keys(game.tokens)[Object.values(game.tokens).indexOf(data.token)];
				client.player = name;

				let pl = await game.db.get("players", name);

				let msg = "";

				if (!pl.generated) {
					msg = "\n¬WWelcome, new player!¬*\n¬WIntercept has only recently come out of beta and feedback would be appreciated.¬*\n¬WYou can join our Discord at:¬* ¬Bdiscord.gg/ZXqTf2q¬*";

					msg += "\n\n¬r[¬*¬RERROR¬*¬r]¬* ¬RNo system link found. Creating...¬*";

					const sys = await game.systems.create();
					console.log(sys);

					msg += "\n¬g[¬*¬GRESOLVED¬*¬g]¬* Connected to ¬g"+sys.ip+"¬*\n";

					pl.main_system = sys.ip;
					pl.connected_to = sys.ip;
					pl.last_connection = sys.ip;

					const lines = [
						"¬ytzaeru:¬* hello there! ^^",
						"¬ratrox:¬* welcome. I suppose you need some tools.",
						"¬ratrox:¬* you can collect some from one of our systems. no logging so it's safe.",
						"¬ratrox:¬* ¬gman¬* will provide information about the tools we give you.",
						"¬ratrox:¬* after you take them you can dig through some precursor systems at ¬Bhope.xyz¬*.",
						"¬ratrox:¬* you can use ¬ghelp¬* for a general rundown of how things work here.",
						"¬ratrox:¬* I believe that's all. ¬gconnect 0.0.0.0 0p3nD00r¬*"
					];
					for (let i = 0; i<lines.length; i++) {
						setTimeout(()=>{
							game.systems.broadcast(sys, lines[i]);
						}, 1000+2500*i)
					}

					pl.generated = true;

					console.log(`Assigned system ${sys.ip} (${sys.id}) to ${name}`);
				}

				msg += "¬g[¬*¬GSUCCESS¬*¬g]¬* Terminal interface online.";

				pl.last_login = Date.now();

				await game.db.set("players", pl.id, pl);

				console.log(`${name} connected`);

				return client.send({
					event: "connect",
					success: true,
					cfg: pl.cfg,
					player: {
						ip: pl.main_system,
						conn: pl.connected_to
					},
					msg: msg
				});
			} else return client.send({
				event: "connect",
				success: false,
				error: "Unauthorised"
			});
		} else if (data.request == "command") {
			if (client.player) {
				if (typeof data.cmd != "string") return client.send({
					event: "error",
					success: false,
					error: "Invalid command"
				});

				let vchrs = "abcdefghijklmnopqrstuvwxyz";
				vchrs += vchrs.toUpperCase()+"0123456789";

				let cmd = "";
				let args = [];
				let flags = [];

				let split = data.cmd.trim().split(" ");
				for (let i = 0; i<split.length; i++) {
					const w = split[i];
					if (i == 0) cmd = w;
					else if ((w.startsWith("-") && w.length == 2 && vchrs.includes(w[1])) || w.startsWith("--")) flags.push(w);
					else args.push(w);
				}

				if (cmd.includes("/")) return;

				let treq = cmd.length*50;
				if (game.lt[id] > Date.now()-treq) {
					console.log(`Bot guideline violation (${Date.now()-game.lt[id]}/${treq})`);
				}
				game.lt[id] = Date.now();

				if (fs.existsSync(`./cmds/${cmd}.js`)) {
					const pl = await game.db.get("players", client.player)

					let running_sys = flags.includes("-l") || flags.includes("--local") ? pl.main_system : pl.connected_to,
					rs = await game.db.filter({ip:running_sys}, "systems"),
					msg = ""

					if (rs.length)
						running_sys = rs[0];
					else {
						//console.log(`${pl.id} falling back to main system`);
						running_sys = (await game.db.filter({ip:pl.main_system}, "systems"))[0];
						pl.connected_to = pl.main_system;
						await game.db.set("players", pl.id, pl);
						msg += "¬R[ERROR]¬* Connected system is suffering from ¬rcritical existance failure¬*. Falling back to main system.\n"
					}

					if (running_sys.type == "honeypot") {
						running_sys.logs.push(`${pl.main_system}: ${data.cmd}`);
						await game.db.set("systems", running_sys.id, running_sys);
					}

					msg += await game.runFile(`./cmds/${cmd}.js`, pl, running_sys, args, flags)
					if (msg && !running_sys.hardware.cpu)
						msg = game.lib.corrupt(msg, 6);

					return client.send({
						event: "command",
						success: true,
						cmd: cmd,
						msg: msg
					});
				} else return client.send({
					event: "error",
					success: false,
					error: "Invalid command"
				});
			} else return client.send({
				event: "command",
				success: false,
				error: "Unauthorised"
			});
		} else if (data.request == "stats") {
			const systems = await game.db.filter({}, "systems");
			const players = await game.db.filter({}, "players");
			const npcs = players.filter(p=>p.npc||p.unique);

			let bits = 0;
			systems.map(sys=>sys.bits).filter(b=>b).forEach(b=>bits+=b);

			return client.send({
				event: "stats",
				systems: systems.length,
				players: players.length-npcs.length,
				active_clients: game.clients.length,
				npcs: npcs.length,
				bits: bits
			});
		}
	} catch(e) {
		console.log("Request resulted in error:");
		console.error(e);
		client.send({
			event:"error",
			error:`Error: ${e.name}`
		});
	}
}

// Servers //

function genericNewConnection(client) {
	console.log("New connection")
	client = Object.assign(client, {
		connected: Date.now(),
		cull: function () {
			if (!game.clients.includes(this)) return false;
			game.clients.splice(game.clients.indexOf(this), 1)
		},
		send_metadata: function () {
			client.send({
				event: "info",
				client_id: this.id,
				client_type: this.type,
				connected_at: this.connected,
				date: Date.now()
			})
		}
	})

	client.sock.on("data", data=>handle(client, data));

    client.sock.on("disconnect", ()=>{
        console.log(`Client ${client.id} disconnected`);
        client.cull();
     });

	client.sock.on("close", () => {
		console.log(`Client ${client.id} closed connection`)
		client.cull()
	})
	client.sock.on("error", (e) => {
		console.log(`Client ${client.id} (player: ${client.player}) threw error:`)
		console.log(e)
		client.drop()
	})

        client.send_metadata();

        console.log(`Handled connection from ${client.type} client - ID: ${client.id}`);
        game.clients.push(client);
}

/* For socket.io connections; generally used by the web client. */
game.sv1 = require("socket.io")({secure:true});
game.sv1.on("connect", async sock=>{
	genericNewConnection({
		type: "socket.io",
		id: sock.id,
		sock: sock,
		send: function(data) {
			let out = data;
			if(typeof data !== "object") {
				try {
					out = JSON.parse(data);
				} catch(e) {
					out = data;
				}
			}
			this.sock.emit("data", data);
			//this.sock.emit("data", data => typeof data != "object"?JSON.parse(data):data)
		},
		drop: function() {
			this.sock.disconnect()
			this.cull()
		}
	});
});
game.sv1.listen(game.cfg.server.port1);

/* For raw connetions; this'll be used by other clients. */
game.sv2 = require("net").createServer();
game.sv2.on("connection", sock=>{
	genericNewConnection({
		type: "raw",
		id: `${Date.now()}${game.lib.gen(13)}`,
		sock: sock,
		send: function (data) {
			try {
				this.sock.write((typeof data == "object"?JSON.stringify(data):data) + "\n")
			} catch(e) {
				this.cull();
			}
		},
		drop: function() {
			this.sock.end()
			this.cull()
		}
	});
});
game.sv2.listen(game.cfg.server.port2, game.cfg.server.ip);

// Clean exit //

["SIGINT", "SIGTERM"].forEach(s=>process.on(s, ()=>{
	console.log("Dropping clients");
	game.clients.forEach(client=>client.drop());

	console.log("Goodbye");
	process.exit();
}));

// Interface //

require("./interface");

})();
