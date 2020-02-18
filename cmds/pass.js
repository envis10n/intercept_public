(async(pl, sys, args, flags)=>{
	if (args[0] == "see")
		return sys.pass;

	if (args[0] == "reset") {
		sys.pass = game.lib.gen(6);
		game.db.set("systems", sys.id, sys);
		return `Password reset. New password is ${sys.pass}.`;
	}

	return "Usage: pass (see/reset)";
})