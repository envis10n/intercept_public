(async(pl, sys, args, flags)=>{
	const v = parseInt(args[0]);
	if (!Number.isNaN(v) && v >= 0 && v <= 10) {
		if (!pl) return "Execution failed";
		pl.cfg.vol = v;
		await game.db.set("players", pl.id, pl);
		game.clients.filter(c=>c.player==pl.id).forEach(c=>c.send({
			event: "cfg",
			cfg: {
				vol: v
			}
		}));
		return "Success";
	} else return "Usage: vol [0-10]";
})