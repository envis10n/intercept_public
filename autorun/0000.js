const pw = "0p3nD00r";

let sys = await game.db.get("systems", "0.0.0.0");
if (!sys) {
	console.log("Creating 0.0.0.0");

	sys = await game.systems.create(undefined, {
		role: "0.0.0.0",
		id: "0.0.0.0",
		ip: "0.0.0.0",
		fs: {},
		software: [],
		hardware: {
			cpu: 1,
			ram: 1
		},
		bits: 0,
		port_count: 0,
		pass: "0p3nD00r"
	});
}

const sw = [
	"probe",
	"breach",
	"getpw"
];

game.ai.create_logic(undefined, 10000, async(l)=>{
	sys = await game.db.get("systems", "0.0.0.0");

	let change = false;

	if (sys.pass != pw) {
		change = true;
		sys.pass = pw;
		await game.systems.broadcast(sys, "¬Bzd_cbot1:¬* Don't be like that.");
	}

	for (const n of sw) {
		if (!sys.software.find(s=>s.type==n)) {
			let name = "unknown";
			switch (n) {
				case "probe":
					name = "atom_probe";
					break;
				case "breach":
					name = "zd_infiltr8tr";
					break;
				case "getpw":
					name = "void_pw";
					break;
			}

			sys.software.push({
				name,
				type: n,
				tier: 1,
				installed: false
			});

			if (!change) change = true;
		}
	}

	if (change)
		await game.db.set("systems", "0.0.0.0", sys);
});
