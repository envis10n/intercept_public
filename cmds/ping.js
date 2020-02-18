(async(pl, sys, args, flags) => {
	if(!args[0]) return "Usage: ping [ip...]"
	async function fetchOneAndPing() {
		/* Yes, I'll admit it -- this *is* hacky.
		 * Best way I could come up with though
		 * I want continuous output for this.
		 * On the plus side, the way it's written now
		 * if you kill one ping job, it stops all the rest
		 */
		let target_ip = args.shift(),
		target = (await game.db.filter({ip: target_ip}, "systems"))[0];

		if(args.length)
			game.systems.jobs.create(sys, "ping", fetchOneAndPing, target ? 500 : 2000);

		return `¬w${target_ip}: ` + (target ? `reply in ${(Math.random()*10+10).toFixed(1)} ms` : "system not responding");
	}

	game.systems.jobs.create(sys, "ping", fetchOneAndPing, 100);
	return "¬wping initiated.¬*"
})
