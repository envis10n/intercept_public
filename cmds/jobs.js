(async(pl, sys, args, flags)=>{
	if (args[0] == "list") {
		let r = [];

		if (game.jobs[sys.id]) {
			for (const ix in game.jobs[sys.id]) {
				const job = game.jobs[sys.id][ix];
				if (!job.meta.malware) r.push(`${ix}: ${job.name}: ${Math.round((job.finishes-Date.now())/1000)}s remain`);
			}
		}

		if (!r.length) r = ["No active jobs."];

		return r.join("\n");
	}

	else if (args[0] == "kill") {
		if(!args[1]) return `Usage: jobs kill [id]`
		if(!(args[1] in game.jobs[sys.id])) return `jobs: kill: ${args[0]}: Job ID not found`
		const job = game.jobs[sys.id][args[1]];

		if (job.meta.malware || job.meta.nokill) return "This job cannot be killed.";

		job.stop();

		return "Job killed.";
	}

	return `Active jobs: ${sys.id in game.jobs ? Object.keys(game.jobs[sys.id]).length : 0}
Memory usage: ${game.jobs[sys.id] ? game.jobs[sys.id].length : 0}GB/${sys.hardware.ram}GB

Usage: jobs [command]
Commands:
  list
  kill [id]`;
})
