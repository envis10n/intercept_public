(async(pl, sys, args, flags)=>{
	if (!game.systems.software.active(sys, "antivirus"))
		return `Execution failed: Missing software.`;

	const r = ["¬bScanning system...¬*"];

	let i = 0;

	for (const sw of sys.software) {
		if (sw.malware) {
			r.push(`¬bTerminated malware: ${sw.name} (${sw.type})¬*`);
			if (sw.malware.loyalty)
				await game.systems.broadcast(sys, `${sw.name}: Connection to ${sw.loyalty} severed`);
			sys.software.splice(i, 1);
		}
		i++;
	}

	const jobs = game.jobs[sys.id];
	if (jobs) {
		i = 0;
		for (const job of jobs) {
			if (job.meta.malware) {
				r.push(`¬bTerminated job: ${job.name}¬*`);
				job.stop();
			}

			i++;
		}
	}

	await game.db.set("systems", sys.id, sys);

	r.push("¬bScan complete.¬*");

	return r.join("\n");
})