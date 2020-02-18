(async(pl, sys, args, flags)=>{
	async function payment(to="ATOM_NODE_XQ9EXN", amt) {
		let xf = await game.ai.runcmd("bits", ["transfer", to, amt], [], pl, sys);

		const p = xf.includes("SUCCESS");
		return {
			success: p,
			msg: p?"Payment processed successfully":`Code ${Math.floor(xf.length**2.55)}: ${xf}`
		};
	}

	if (args[0] == "upgrade_cpu") {
		if (sys.hardware.cpu < 16) {
			let n = sys.hardware.cpu+1;
			let c = Math.floor(10*(n*2.5)**2);

			if (args[1] == "confirm") {
				let p = await payment("ATOM_NODE_XQ9EXN", c);
				if (p.success) {
					sys.hardware.cpu = n;
					await game.db.set("systems", sys.id, sys);
				}
				return p.msg;
			}

			return `Add "confirm" to confirm CPU upgrade to Level ${n} for ${c}β`
		} else return "There are currently no CPU upgrades available for your system";
	}

	if (args[0] == "upgrade_ram") {
		if (sys.hardware.ram < 8) {
			let n = sys.hardware.ram*2;
			let c = 500*n;

			if (args[1] == "confirm") {
				let p = await payment("ATOM_NODE_XQ9EXN", c);
				if (p.success) {
					sys.hardware.ram = n;
					await game.db.set("systems", sys.id, sys);
				}
				return p.msg;
			}

			return `Add "confirm" to confirm RAM upgrade to ${n}GB for ${c}β`;
		} else return "There are currently no RAM upgrades available for your system."
	}

	if (args[0] == "upgrade_ports") {
		if (sys.port_count < 4) {
			let c;
			let pc = sys.port_count+1;
			let cc = sys.core_count;
			switch (sys.port_count+1) {
				case 1:
					c = 1000;
					break;
				case 2:
					c = 2500;
					break;
				case 3:
					c = 5000;
					break;
				case 4:
					c = 15000;
					cc = 2;
					break;
			}
			if (!c) return "A fatal error occured. Terminating.";

			if (args[1] == "confirm") {
				let p = await payment("ATOM_NODE_XQ9EXN", c);
				if (p.success) {
					sys.port_count = pc;
					sys.core_count = cc;

					sys.ports.push({
						core_nodes:[],
						nodes:[],
						breached_cores:[],
						locks:{}
					});

					await game.db.set("systems", sys.id, sys);
				}
				return p.msg;
			}

			return `Add "confirm" true to confirm port upgrade to ${cc} cores/${pc} ports for ${c}β`;
		} else return "There are currently no port upgrades available for your system.";
	}

	return `ATOM(NET)* HARDWARE MANAGER

CPU: ${game.systems.hardware.CPUs[sys.hardware.cpu]||"UNKNOWN"} (Level ${sys.hardware.cpu})
RAM: ${sys.hardware.ram}GB

Usage: hardware [command]
Commands:
  upgrade_cpu
  upgrade_ram
  upgrade_ports`;
})