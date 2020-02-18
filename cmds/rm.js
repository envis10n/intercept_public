(async(pl, sys, args, flags)=>{

	async function handleOne(thisarg) {
		const p = game.systems.fs.parse(sys.fs, thisarg)
		if(!p.valid) return `rm: cannot remove '${thisarg}': No such file or directory`;
		if(!p.file) return `rm: cannot remove '${thisarg}': Is a directory`;

		delete sys.fs[p.dir][p.name]
		await game.db.set("systems", sys.id, sys)

		if(flags.includes("-v") || flags.includes("--verbose"))
			return `removed '${thisarg}'`
	}

	if (sys.fs_locked) return "rm: Filesystem locked.";

	if(!args.length) return "Usage: rm [full path]"

	const out = []

	while(args.length) {
		let thisarg = args.shift(),
		ret = await handleOne(thisarg);
		if(ret)
			out.push(ret)
	}
	return out.join("\n")
})
