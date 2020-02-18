async function contractGen() {
	const types = {
		"bitsSteal":[15, 25],
		"fileDelete":[50, 25],
		"swSteal":[75,25]
	};

	const contracts = await game.db.filter({}, "contracts");
	const av = contracts.filter(c=>c.available);

	for (let i = 0; i<25-av.length; i++) {
		const type = Object.keys(types)[Math.floor(Math.random()*Object.keys(types).length)];
		const reward = Math.floor(Math.random()*types[type][0])+types[type][1];

		game.contracts.create(type, reward);
	}
}

setInterval(contractGen, 600000, "contracts")
await contractGen();