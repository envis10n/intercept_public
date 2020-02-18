c = args.join(" ");

try {
	const res = await eval(`(async()=>{${c}})()`);
	console.log(res);
} catch(e) {
	console.log(e.toString());
}
