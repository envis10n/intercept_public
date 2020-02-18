(async function(ip) {
	const out = new Map();
	const softwares = (await game.db.filter({ip}, "systems"))[0].software;

	for(let software of softwares) {
		let cnt;
		if(out.has(software.type))
			cnt = out.get(software.type);
		else
			cnt = 0;

		out.set(software.type, cnt+1);
	}

	return out;
})
