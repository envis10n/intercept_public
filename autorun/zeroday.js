// ZeroDay //

let corp = await game.db.get("corps", "ZeroDay");
if (!corp) {
	corp = await game.corps.create("ZeroDay");
}

// BL1SS //

let bl1ss = await game.db.get("players", "BL1SS");
if (!bl1ss) {
	const sys = await game.systems.create("BL1SS", {
		bits: 10000,
		pass: game.lib.gen(8),
		hardware: {
			cpu: 15,
			ram: 128
		},
		port_count:4,
		core_count:2
	});

	bl1ss = await game.npcs.create("BL1SS", {
		unique: true,
		main_system: sys.ip
	});
}