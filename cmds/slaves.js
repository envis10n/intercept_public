(async(pl, sys, args, flags)=>{
	let slaves = await game.db.db.table("systems").filter(system => system("software").contains(
		software => software("type").eq("slave").and(
			software("installed").eq(true).and(
				software("loyalty").eq(sys.ip)
			)
		)
	));

	if (args[0] == "list") {
		return slaves.map(s=>`¬y[${s.ip}] (Pass ${s.pass}, bits ${s.bits}β)¬*`).join("\n");
	}

	return `Usage: slaves [command]

¬y${slaves.length} slave${slaves.length==1?"":"s"} active¬*
¬yCommands:¬*
¬y list¬*`;
})
