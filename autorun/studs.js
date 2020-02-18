const players = await game.db.filter({}, "players");

const users = [
	"TSU_ATOM_NET",
	"ATOM_CORE_AI8T56",
	"ATOM_NODE_H7USD8",
	"ATOM_NODE_XQ9EXN", // hardware payments
	"ProAV", // ProAV payments
	"BlackWebBot", // BlackWeb payments
	"LostStar",
	"LostStarInternal", // LostStar NPC refills

	"tzaeru", "atrox", "spark", "rocket", "sammy", "winter", "zd_cbot1"
];

for (const u of users) {
	if (!players.find(pl=>pl.id==u)) {
		await game.npcs.create(u, {
			unique: true
		});
	}
}