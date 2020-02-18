console.log("Game stats", "");

// Players //

const players = await game.db.filter({}, "players");

console.log("Players:", `${players.filter(p=>!p.unique).length} overall`, `${players.filter(p=>p.unique).length} NPC AI`, "")

// Systems //

const systems = await game.db.filter({}, "systems");

console.log("Systems:", `${systems.length} overall`, "");

// Bits //

let bits = 0;
systems.forEach(sys=>bits += sys.bits);

console.log("Bits:", `${bits} overall`, "");

console.log("Top 5:");
let tp = [...systems];
for (let i = 0; i<5; i++) {
	let ix;
	let sys;

	let ct = 0;

	for (const s of tp) {
		if (s.bits > ct) {
			ix = tp.indexOf(s);
			sys = s;

			ct = s.bits;
		}
	}

	const so = players.find(pl=>pl.main_system == sys.ip);
	console.log(`${so?so.id:`${sys.id} (NPC)`} with ${sys.bits}β`);

	tp.splice(ix, 1);
}