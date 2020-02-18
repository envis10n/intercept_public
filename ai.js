const fs = require("fs"),
{slurp} = require("./async_helpers");

function runcmd(cmd, args=[], flags=[], pl, sys) {
	return game.runFile(`./cmds/${cmd}.js`, pl, sys, args, flags)
}
global._runcmd = runcmd;

const acts = {
	farm_t1:{
		id: "farm_t1",
		priority: 20,
		software: ["probe", "breach", "getpw"],
		stages:[{
			name: "target",
			delay: 5,
			exec: async (u, m)=>{
				let systems = await game.db.filter({role:"t1_abandoned_npc"}, "systems");
				systems = systems.filter(s=>s.bits>0);

				if (!systems.length) return null;

				m.targets = [];
				let count = Math.floor(Math.random()*10)+5;
				for (let i = 0; i<count; i++) {
					const idx = Math.floor(Math.random()*systems.length);

					if (!systems[idx]) break;

					m.targets.push(systems[idx].ip);
					systems.splice(systems[idx].ip, 1);
				}

				if (!m.targets.length) return null;

				return true;
			}
		},{
			name: "farm",
			delay: 25,
			exec: async (u, m)=>{
				if (!m.tar)
					m.tar = m.targets.pop();
				let ip = m.tar;

				let tar = await game.db.filter({ip:ip}, "systems");
				if (!tar.length) {
					m.targets.splice(m.targets.indexOf(ip), 1);
					return;
				};
				tar = tar[0];

				const ts = (await game.db.filter({ip:u.connected_to}, "systems"))[0];

				let pi = 0;
				for (const p of tar.ports) {
					for (const node of p.core_nodes)
						if (!p.breached_cores.includes(node)) {
							breach = false;

							//console.log(`${u.id} breaching core ${node} on port ${pi} on ${tar.ip}`);
							//await runcmd("breach", [tar.ip, pi, node], [], u, ts);

							p.breached_cores.push(node);
							await game.db.set("systems", tar.id, tar);

							return "redo";
						}
					pi++;
				}

				if (u.connected_to == ip) {
					console.log(`Transferring ${tar.bits} from ${tar.id}`);
					if (tar.bits) {
						let amt = tar.bits;

						const tax = Math.floor(amt/2);
						if (tax && m.tax) {
							amt -= tax;
							if (tax && m.tax) await runcmd("bits", ["transfer", m.tax, tax], [], u, ts);
						}

						await runcmd("bits", ["transfer", u.id, amt], [], u, tar);
					}
					await runcmd("exit", [], [], u, tar);

					if (m.targets.length) {
						m.tar = null;
						return "redo";
					}
				} else {
					if (u.connected_to != u.main_system) {
						await runcmd("exit", [], [], u, ts);
						return "redo";
					}

					await runcmd("connect", [tar.ip, tar.pass], [], u, ts);

					if (u.connected_to != ip) {
						m.tar = null;
						console.log(`${u.id} failed to hack ${tar.ip}`);
					}

					return "redo";
				}

				return true;
			}
		}]
	}
};

const ai = {logic:{}};

ai.runcmd = runcmd;

ai.create_logic = (id, intvl=10000, exec)=>{
	if (ai.logic[id])
		clearInterval(ai.logic[id].iid)

	const l = {
		id,
		m:{},
		exec,
		intvl,
	};

	if (!l.exec)
		l.exec = (l)=>{};

	l.iid = setInterval(()=>l.exec(l), l.intvl);

	ai.logic[id] = l;

	return l;
}

ai.create_corp_logic = async (cid, exec)=>{
	const l = {
		orders:[],
		users:{}
	};

	const corp = await game.db.get("corps", cid);

	for (const m of corp.members)
		l.users[m] = {};

	l.exec = exec?exec:async ()=>{
		const corp = await game.db.get("corps", cid);
		if (!corp) return;

		let update = false;

		let members = [];
		for (const m of corp.members) {
			const pl = await game.db.get("players", m);
			if (pl)
				members.push(pl);
			else {
				if (corp.leaders.includes(m))
					corp.members.splice(corp.leaders.indexOf(m), 1);
				corp.members.splice(corp.members.indexOf(m), 1);
				update = true;
			}
		}

		if (l.orders.length == 0) {
			l.orders.push("farm_t1");
		}

		for (const m of corp.members.filter(c=>!corp.leaders.includes(c))) {
			if (!l.users[m].m) {
				l.users[m].m = {
					order: "farm_t1",
					stage: 0,
					ticks: 10,
					tax: corp.leaders.length?corp.leaders[Math.floor(Math.random()*corp.leaders.length)]:null
				};
			}

			if (l.users[m].m.ticks <= 0) {
				const u = await game.db.get("players", m);

				const stage = l.users[m].m.stage;
				const r = await acts[l.users[m].m.order].stages[stage].exec(u, l.users[m].m);

				if (r) {
					if (r != "redo") {
						l.users[m].m.stage++;
						if (!acts[l.users[m].m.order].stages[l.users[m].m.stage]) {
							console.log("Order complete");
							delete l.users[m].m;
						}
					}

					if (l.users[m].m) {
						l.users[m].m.ticks = acts[l.users[m].m.order].stages[l.users[m].m.stage].delay;
					}
				}
			} else {
				//l.users[m].m.ticks--;
			}
		}
	};

	return l;
}

module.exports = ai;
