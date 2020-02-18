(async(pl, sys, args, flags)=>{
	if (sys.fs_locked) return "rmdir: Filesystem locked.";

	if (args[0]) {
		if (args[0] in sys.fs) {
			delete sys.fs[args[0]];
			await game.db.set("systems", sys.id, sys);
			return "";
		} else return `rmdir: failed to remove '${args[0]}': No such file or directory`;
	} else return `Usage: rmdir [name]`;
})