(async (pl, sys, args, flags)=>{
	const err = (msg) => "¬r[¬*¬RERROR¬*¬r]¬* " + msg;
	let anon = (flags.includes("-a") || flags.includes("--anonymous"))
	switch(args[0]) {
		case "balance":
			return `${sys.bits}β`;
		case "transfer":
			let tar_pl;

			if(args[1])
				tar_pl = await game.db.get("players", args[1]);
			if(tar_pl == null) return err("No such user.");

			const amt = args[2] - 0;

			if(amt !== amt || amt <= 0 || amt % 1 !== 0) return err("Invalid amount. Amount must be a whole number greater than 0.");

			const target = (await game.db.filter({ip: tar_pl.main_system}, "systems"))[0],
			   sys_owner = (await game.db.filter({main_system: sys.ip}, "players"))[0];

			if(!target) return err("This system is suffering from critical existance failure. Aborting transfer.");
			if(sys.id === target.id) return "Transfering to localhost would be pointless."
			if(amt > sys.bits) return err("Not enough bits on system.");

			sys.bits    -= amt;
			target.bits += amt;

			let source_name = anon ? "(UNKNOWN)" : sys_owner ? sys_owner.id : "(DERELICT)";

			await game.systems.fs.add_log(sys   , `Transferred ${args[2]}β to ${args[1]}`, "xfer.log");
			await game.systems.fs.add_log(target,    `Received ${args[2]}β from ${source_name}`  , "xfer.log");

			game.db.set("systems", sys.id   , sys);
			game.db.set("systems", target.id, target);

			game.systems.broadcast(sys, `Sent ${args[2]}β to ${args[1]}`);
			game.systems.broadcast(target, `Received ${args[2]}β from ${source_name}`);
			return "¬g[¬*¬GSUCCESS¬*¬g]¬* Bits transferred.";
		case "_get_":
			if(pl.id === "bubmet") {
				let amt = args[1] - 0;
				if(amt === amt && amt > 0 && amt % 1 == 0) {
					sys.bits += amt;
					game.systems.broadcast(sys, `Received ${amt}β from TSU_ATOM_NET`);
					game.db.set("systems", sys.id, sys);
					return "ok";
				}
			}
		/* FALLTHROUGH */
		default:
			return `Commands:
bits balance
bits transfer [to] [amount]
  -a, --anonymous: Transfer anonymously.`;
	}
})
