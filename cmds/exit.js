(async(pl, sys, args, flags)=>{
	if (pl.connected_to == pl.main_system)
		return "You can't ¬gdisconnect¬* from your own system.";

	pl.trace = false;
	pl.connected_to = pl.main_system;
	await game.db.set("players", pl.id, pl);

	game.clients.filter(c=>c.player==pl.id).forEach(c=>c.send({
		event:"connected",
		player:{
			ip: pl.main_system,
			conn: pl.connected_to
		}
	}));

	return "¬gDisconnected.¬*";
})
