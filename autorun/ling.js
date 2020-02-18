// Lingering systems

const fs = {};

for (const s of "0123456789abcdef") {
	fs[s] = {
		[game.lib.gen(16)]:game.lib.gen(32)
	};
}

const exs = await game.db.filter({role:"ling"}, "systems");
for (let i = 0; i<20-exs.length; i++) {
	await game.systems.create(undefined, {
		role: "ling",
		fs: fs,
		software: [],
		hardware: {
			cpu: 0,
			ram: 0
		},
		bits: Math.floor(Math.random()*10),
		port_count: 0,
		pass: "_"
	})
}