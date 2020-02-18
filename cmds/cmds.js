(async(pl, sys, args, flags)=>{
	const categories = {
		"client":[
			"clear",
			"vol"
		],
		"filesystem":[
			"cat",
			"ls",
			"mkdir",
			"rm",
			"rmdir"
		],
		"information":[
			"cmds",
			"colors/colours",
			"help",
			"man"
		],
		"misc":[
			"sl"
		],
		"remote":[
			"connect",
			"exit/disconnect/dc",
			"slaves"
		],
		"software":[
			"antivirus",
			"breach",
			"getpw",
			"honeypot",
			"malware",
			"probe",
			"software",
			"trace"
		],
		"system":[
			"abandon",
			"bits",
			"broadcast",
			"hardware",
			"jobs",
			"pass",
			"ports",
			"scan",
			"specs"
		],
		"web":[
			"web"
		]
	}

	if (args[0]) {
		if (categories[args[0]]) {
			return categories[args[0]].map(c=>`¬g${c}¬*`).join("\n");
		} else return "Unknown category."
	}

	return `Categories:
${Object.keys(categories).map(c=>`¬g${c}¬*`).join("\n")}`;
})
