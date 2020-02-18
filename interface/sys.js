const players = await game.db.filter({}, "players");
const systems = await game.db.filter({}, "systems");

switch (args[0]) {
	case "get":
		const s = systems.find(sys=>sys.id==args[1]||sys.ip==args[1]);

		if (s) {
			switch (args[2]) {
				case "set_ip":
					const pls = await players.filter(p=>p.main_system==args[1]||p.connected_to==args[1]);

					pls.forEach(p=>{
						if (p.main_system == args[1])
							p.main_system = args[3];
						if (p.connected_to == args[1])
							p.connected_to = args[3];
						
						game.clients.filter(c=>c.player==p.id).forEach(c=>c.send({
							event:"connected",
							player:{
								ip: p.main_system,
								conn: p.connected_to
							}
						}));

						game.db.set("players", p.id, p);
					});

					s.ip = args[3];

					game.db.set("systems", s.id, s);

					break;
				case "set_bits":
					try {
						game.systems.broadcast(s, `Received ${parseInt(args[3])-s.bits}β from TSU_ATOM_NET`);
						s.bits = parseInt(args[3]);
						game.db.set("systems", s.id, s);
					} catch(e) {console.log(e)}
					break;
				case "rotate":
					if (players.find(p=>p.main_system==s.ip) && args[3] != "yes") {
						console.log("WARNING: This system is owned by a player.", "This will require you to manually reset the player's IP.", "Add 'yes' to continue.");
						return "";
					}

					let change = false;

					if (game.systems.is_breached(s)) {
						console.log(`Resetting ${s.id}`)
			
						await game.systems.drop_connections(s);
			
						s.ip = await game.systems.generate_unique_ip();
			
						for (const p in s.ports)
							s.ports[p] = await game.systems.ports.gen_port();
			
						change = true;
					}
			
					if (s.bits < 200) {
						s.bits += Math.floor(Math.random()*(200-s.bits))+1;
						change = true;
					}
					
					if (change) game.db.set("systems", s.id, s);

					break;
			}

			const n = {};
			for (const prop in s)
				if (prop != "fs" && prop != "ports")
					n[prop] = s[prop];
			console.log(`sys get ... [set_ip, set_bits, rotate]`);
			console.log(JSON.stringify(n, null, 4));
		} else if (args[1]) return "System not found";

		return "get [ip] {cmd}";
	case "create":
		const sys = await game.systems.create();
		console.log(sys.id);
		return "";
		break;
}

console.log("sys ...", "get", "create")