(async(pl, sys, args, flags)=>{
	if (sys.fs_locked) return "mkdir: Filesystem locked.";

	if (args[0]) {
		if (/[^_a-zA-Z0-9]/.test(args[0]))
			return "mkdir: Invalid dirname.";

		if (args[0] in sys.fs)
			return `mkdir: cannot create directory '${args[0]}': File exists`
		else {
			sys.fs[args[0]] = {};
			await game.db.set("systems", sys.id, sys);
			return "";
		}
	} else return "Usage: mkdir [name]";
})