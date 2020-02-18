const players = await game.db.filter({}, "players");

switch (args[0]) {
	case "list":
		for (const pl of players)
			console.log(`${pl.id}${pl.unique?" (NPC)":""}`);

		return;
	case "get":
		const pl = players.find(p=>args[1]&&p.id==args[1]);
		if (pl) {
			switch (args[2]) {
				case "set_ip":
					pl.main_system = args[3];
					pl.connected_to = args[3];

					game.clients.filter(c=>c.player==pl.id).forEach(c=>c.send({
						event:"connected",
						player:{
							ip: pl.main_system,
							conn: pl.connected_to
						}
					}));

					game.db.set("players", pl.id, pl);

					break;
			}

			console.log("players get ... [set_ip]");
			console.log(JSON.stringify(pl, null, 4));
		} else console.log("Player not found");

		return;
}

console.log("players ...", "get", "list");