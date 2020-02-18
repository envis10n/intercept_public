(async(pl, sys, args, flags)=>{
	if (!game.systems.software.active(sys, "getpw"))
		return `Execution failed: Missing software.`;
	if(!args[0])
		return "Usage: getpw [ip]"
	let target = (await game.db.filter({ip:args[0]}, "systems"))[0];

	if(!target)
		return `getpw ${args[0]}: Name or service not known`
	if(!game.systems.is_breached(target))
		return `getpw: ${args[0]}: Target isn't breached`
	const r = ["¬RScraping for password...¬*"]
	for(const port in target.ports)
		r.push(`¬RScraped port ${port}...¬*`)
	r.push(`¬RFound password¬*`)
	r.push(`¬RPassword:¬* ¬r${target.pass}¬*`)
	return r.join("\n")
})
