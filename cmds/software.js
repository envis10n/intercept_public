(async(pl, sys, args, flags)=>{
	if (sys.type == "honeypot")
		return "¬RSoftware is unsupported on this system.¬*";

	if (args[0] == "list") {
		  if (sys.software.length == 0)
			  return "No software detected.";

		  const r = ["Software:"];

		  let i = 0;
		  for (const sw of sys.software) {
			  if (!(sw.installed && sw.malware))
				r.push(`${i}: ¬${sw.installed?"g":"r"}${sw.name}${sw.name!=sw.type?" ("+sw.type+")":""}¬*`);
			  i++
		  }

		  return r.join("\n");
	}

	if (args[0] == "install") {
		if (sys.id == "0.0.0.0")
			return "¬RSystem administrator has disallowed software installation.¬*";

		if (args[1]) {
			if (sys.software[args[1]]) {
				const sw = sys.software[args[1]];
				if (sw.installed) return "Software is already installed";
				if (sys.software.find(s=>s.installed&&s.type==sw.type)) return "Software type already installed";
				if (sw.permanent) return "Failed to install software";

				sw.installed = true;

				if (sw.malware)
					sw.loyalty = pl.main_system;

				switch (sw.type) {
					case "scrambler":
						if (sys.fs_locked) return "edit: Filesystem locked.";

						game.malware.scrambler(sys);

						sys.software.splice(parseInt(args[1]), 1);

						break;
					case "bitminer":
						game.malware.miner(sys);
						break;
				}

				await game.db.set("systems", sys.id, sys);

				game.systems.broadcast(sys, `${sw.name} installed`);

				return "Success";
			} else return "Software not found";
		} return "Usage: software install [index]";
	}

	if (args[0] == "uninstall") {
		if (args[1]) {
			if (sys.software[args[1]]) {
				const sw = sys.software[args[1]];
				if (!sw.installed) return "Software isn't installed";
				if (sw.malware || sw.permanent) return "Failed to uninstall software";

				sw.installed = false;

				await game.db.set("systems", sys.id, sys);

				game.systems.broadcast(sys, `${sw.name} uninstalled`);

				return "Success";
			} else return "Software not found";
		} return "Usage: software uninstall [index]";
	}

	if (args[0] == "transfer") {
		if (args[1]) {
			if (args[2] && args[3]) {
				let tar = await game.db.filter({ip:args[2]}, "systems");

				if (!tar.length) return `software: transfer: ${args[2]}: Name or service not known`;
				tar = tar[0];

				if (tar.type == "honeypot") return `software: transfer: ${args[2]}: Target system cannot hold this software.`;

				if (tar.id == sys.id) return "Cannot transfer to yourself.";
				if (tar.pass && tar.pass != args[3]) return "Incorrect password";

				if (sys.software[args[1]]) {
					const sw = sys.software[args[1]];
					if (sw.installed) return "Can't transfer installed software";
					if (sw.permanent) return "Failed to transfer software";

					tar.software.push(sw);
					sys.software.splice(parseInt(args[1]), 1);

					let log = `${sw.name} (${sw.type}) @${args[1]} transferred to ${sys.id === "0.0.0.0" ? "[redacted]" : tar.ip}`;
					await game.systems.fs.add_log(sys, log, "xfer.log");
					await game.systems.fs.add_log(tar, `${sw.name} (${sw.type}) transferred from ${sys.ip}`, "xfer.log");
					game.systems.broadcast(sys, log);

					await game.db.set("systems", tar.id, tar);
					await game.db.set("systems", sys.id, sys);

					return "Success";
				} else return "Software not found";
			}
		} return "Usage: software transfer [index] [target ip] [target password]"
	}

	if (args[0] == "destroy") {
		if (args[1]) {
			const sw = sys.software[args[1]];
			if (sw) {
				if (sw.installed) return "Can't destroy installed software";

				sys.software.splice(parseInt(args[1]), 1);

				await game.systems.fs.add_log(sys, `${sw.name} (${sw.type}) @${args[1]} destroyed`, "xfer.log");

				await game.db.set("systems", sys.id, sys);

				return "Success";
			} return "Software not found";
		} return "Usage: software destroy [index]";
	}

	return `Usage: software [command]
Commands:
 list
 install
 uninstall
 transfer
 destroy`
})
