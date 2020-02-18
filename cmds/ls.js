(async(pl, sys, args, flags)=>{
	let r = [];

	for (const dir in sys.fs) {
		r.push(`¬b${dir}/¬*`);
		const files = Object.keys(sys.fs[dir]);
		if (files.length)
			for (const file of files)
				r.push(`	¬g${file}¬*`);
		else r[r.length-1] = `¬b${dir}/ (empty)¬*`;
	}

	return r.join("\n");
})