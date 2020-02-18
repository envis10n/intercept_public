c = args.join(" ");

try {
	console.log( await game.runFile(args[0], ...args.slice(1)) );
} catch(e) {
	console.error(e);
}

/*try {
	const res = await eval(`(async()=>{${c}})()`);
	console.log(res);
} catch(e) {
	console.log(e.toString());
}*/
