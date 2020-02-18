(async (pl, sys, args, flags)=>{
	if (pl.id != "bubmet") return sys.id;

	sys.software.push({
		name: "AW_Sprite_Cranberry",
		type: "soft_drink",
		loaded: false,
		tier: 1,
		size: 152
	});

	await game.db.set("systems", sys.id, sys);
})