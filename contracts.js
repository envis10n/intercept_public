// Contracts //

const contracts = {};

// Generate //

contracts.create = async (type, reward)=>{
	const c = {};

	c.id = game.lib.gen(5);
	const ac = await game.db.filter({}, "contracts");
	while (ac.find(s=>s.id==c.id))
		c.id = game.lib.gen(5);

	c.type = type;

	if (reward == undefined) {
		reward = Math.floor(Math.random()*200)+100;
	}
	c.reward = reward;

	c.available = true;

	await game.db.set("contracts", c.id, c);

	return c.id;
};
contracts.gen = async(c, p)=>{
	switch (c.type) {
		case "bitsSteal":
			c.sys = await game.systems.create(undefined, {
				role: "contractSys",
				contract: c.id,
				bits: Math.floor(Math.random()*35)+10
			});
			c.sys = c.sys.id;

			break;
		case "fileDelete":
			c.fileName = `${game.lib.gen(10)}.json`;

			let fileContent = {};
			for (let i = 0; i<3; i++)
				fileContent[game.lib.gen(16)] = game.lib.gen(20);
			fileContent = JSON.stringify(fileContent);

			c.sys = await game.systems.create(undefined, {
				role: "contractSys",
				contract: c.id,
				fs: {
					work: {
						[`${game.lib.gen(5)}.xs`]:game.lib.gen(45),
						[c.fileName]:fileContent,
						[`${game.lib.gen(9)}.xs`]:game.lib.gen(30),
						[`${game.lib.gen(3)}.xs`]:game.lib.gen(40)
					},
					logs: {}
				},
				bits: Math.floor(Math.random()*20)+20
			});
			c.sys = c.sys.id;

			break;
		case "swSteal":
			const sw = [];

			const pl = [
				"ss_f",
				"antivirus",
				"trace",
				"slave"
			];
			let ct = Math.floor(Math.random()*1)+1;
			if (Math.random()>0.8) ct++;
			for (let i = 0; i<ct; i++) {
				const ix = Math.floor(Math.random()*pl.length);
				sw.push(pl[ix]);
				pl.splice(ix, 1);
			}

			c.sys = await game.systems.create(undefined, {
				role: "contractSys",
				contract: c.id,
				bits: Math.floor(Math.random()*20),
				software: sw.map(n=>{return {
					name: `pt_${n}`,
					type: n,
					tier: 2,
					installed: false,
					malware: n=="slave"?true:undefined
				}})
			});
			c.sys = c.sys.id;

			break;
	}

	if (p) {
		c.user = p;
		c.available = false;

		await game.db.set("contracts", c.id, c);
	}
};

// Exports //

module.exports = exports = contracts;