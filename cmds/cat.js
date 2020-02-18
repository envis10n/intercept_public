(async(pl, sys, args, flags)=>{
	if (args[0] == "cat") return "meow";
	if (!args[0]) return "Usage: cat [full path]"

	const p = game.systems.fs.parse(sys.fs, args[0]);
	//console.log(p);
	if(!p.valid) return `cat: ${args[0]}: No such file or directory`
	if(!p.file) return `cat: ${args[0]}: Is a directory`

	if (p.file.content)
		return p.file.content;
	else if (typeof p.file == "string")
		return p.file;
	else
		return "cat: ${args[0]}: Input/output error";
})
