const fs = _.require("fs"),
{slurp} = _.require("./async_helpers"),
util = _.require("util")

const oTag = "<run>";
const cTag = "</run>";

async function getdirs() {
	let r = [""];

	for (const file of (await util.promisify(fs.readdir)("./web"))) {
		if ((await util.promisify(fs.stat)(`./web/${file}`)).isDirectory())
			r.push(`${file}/`);
	}
	return r;
}

(async(pl, sys, args, flags)=>{
	if(!args[0]) return "Usage: web [domain]\nExample: ¬gweb the.net¬*";

	let code = !(flags.includes("-s") || flags.includes("--static")),
	success = false
	for (const f of (await getdirs())) {
		const path = `./web/${f}${args[0].split("/")[0]}.web`;

		let content;
		try {
			content = await slurp(fs.createReadStream(path))
		} catch(e) {
			if(e.code === "ENOENT")
				continue // NEXT
			return `web: ${args[0]}: Unknown error loading page: ${e.code ? e.code : e.name}`
		}
		/* The following code is EXPERIMENTAL and thus disabled.
		 * But this *should* make the functionality thing it replaces (right below it)
		 * faster and more... consise.
		 * I hope anyway.
		 * Test during low activity. Expect many changes.
		 *
		 * - Fayti1703
		 */
		/*
		content = content.replace(new RegExp(`\n?{oTag}\n?`, "g"), oTag)
		content = content.replace(new RegExp(`\n?{cTag}\n?`, "g"), oTag)
		*/
		while (content.includes(`\n${oTag}`)) content = content.replace(`\n${oTag}`, oTag)
		while (content.includes(`${oTag}\n`)) content = content.replace(`${oTag}\n`, oTag)
		while (content.includes(`\n${cTag}`)) content = content.replace(`\n${cTag}`, cTag)
		while (content.includes(`${cTag}\n`)) content = content.replace(`${cTag}\n`, cTag)

		if (content.includes(oTag)) {
			const print = (...args)=>{
				content += args.join("\n");
			}

			let sr = 0;
			/* Ok so I have no idea how this works
			 * But apparently it does.
			 * I'm *really* going to have to talk with bub about this one
			 *
			 * - Fayti1703
			 */
			while (content.includes(oTag)) {
				let si = content.indexOf(oTag);
				let ei = content.indexOf(cTag);

				if (si > -1 && ei) {
					function rc() {
						content = content.replace(`${oTag}${content.substring(si+oTag.length, ei)}${cTag}`, run?run:"");;
					}

					let run;
					let cd = content.substring(si+oTag.length, ei);
					if (code || cd.startsWith("[force]")) {
						if (cd.startsWith("[force]"))
							cd = cd.replace("[force]", "");
						rc();
						run = await eval(`(async()=>{${cd}})`)(); /* quite urgh this one */
					} else {
						run = "";
						rc();
						sr++;
					}

					//content = content.substring(0, si+cTag.length)+(run?run:"")+content.substring(ei+cTag.length);
				}
			}

			if (sr) content = `¬rPrevented ${sr} script${sr==1?"":"s"} from executing.¬*\n${content}`;
		}
		return content;
	}
	if(!success)
		return `web: ${args[0]}: Name or service not known`
})
