(async(pl, sys, args, flags)=>{
	const pages = {
		"breach":[
			"breach",
			"Command: ¬gbreach¬*",
			"Software: ¬gzd_infiltr8tr¬*",
			"Usage: breach [ip] [port] [node]",,

			"Breach automatically overloads a targeted core node on a target system's port.",
			"A system's core nodes can be exposed using ¬gprobe¬*.",
			"This disabled the targeted core node, requiring a patch to be applied to its port.",
			"Once each of a port's core nodes are disabled, it is considered breached.",,

			"If locks are present on the target, the command will take further arguments as answers.",
			"When a correct answer is provided, the lock will be disarmed. At this point, it no longer requires the argment."
		],
		"connect":[
			"connect",
			"Command: ¬gconnect¬*",
			"Usage: connect [ip] [password]",,

			"Connect opens an SSH connection to another system.",
			"This allows the user to run commands under that system.",
			"While connected to a system, the ¬g-l¬* flag can be used to commands them under your own system."
		],
		"getpw":[
			"getpw",
			"Command: ¬ggetpw¬*",
			"Software: ¬gvoid_pw¬*",
			"Usage: getpw [ip]",,

			"getpw automatically scrapes a target's ports to expose its system password.",
			"This requires each of the target's ports to be breached using ¬gbreach¬*."
		],
		"probe":[
			"probe",
			"Command: ¬gprobe¬*",
			"Software: ¬gatom_probe¬*",
			"Usage: probe [ip] {port} {nodes...}",,

			"Probe provides information about available ports and their respective nodes on a system.",
			"When an IP is provided, the command will expose all ports on that system.",
			"Once a port index is provided, it will then expose the port's nodes.",
			"The command will then take further arguments as up to 6 nodes.",
			"It will attempt to distinguish each node as:",
			"- ¬Gcore (green)¬* nodes",
			"- ¬yadjacent (yellow)¬* nodes",
			"- ¬Runrelated (red)¬* nodes.",
			"Ports can have several core nodes and have been known to have up to 6, but typically 1 or 2."
		]
	}

	if (args[0]) {
		if (pages[args[0]])
			return pages[args[0]].join("\n");
		else return `No manual entry for ${args[0]}`;
	}

	return `What manual page do you want?
	
Available:
${Object.keys(pages).join("\n")}`;
});