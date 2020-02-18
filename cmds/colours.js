const cols = {
	"w":"white",
	"W":"grey",
	"R":"red",
	"r":"lightred",
	"G":"green",
	"g":"lightgreen",
	"B":"blue",
	"b":"lightblue",
	"y":"yellow",
	"o":"orange",
	"P":"pink",
	"p":"lightpink",
	"V":"violet",
	"v":"ultraviolet"
};

(async(pl, sys, args, flags)=>{
	const r = [];

	for (const c in cols)
		r.push(`¬${c}[${c}] ${cols[c]}¬*`);

	return r.join("\n");
})
