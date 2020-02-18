const cmddir = "interface";

// Module //

const EventEmitter = require("events");

const readline = require("readline");

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt:":"
});

global._consoleLog = console.log;
console.log = (...log)=>{
	let cpos = rl.cursor;

	process.stdout.cursorTo(0);
	process.stdout.clearLine();

	_consoleLog(...log);

	rl.prompt();
	rl.cursor = cpos;

	process.stdout.cursorTo(cpos+1);
};

const ci = new EventEmitter();
rl.on("line", (data)=>{
	data = data.trim();

	ci.emit("data", data);

	rl.prompt();
});

rl.prompt();

// Interface //

const fs = require("fs");

ci.on("data", data=>{
	let cmd;
	let args = [];
	
	const split = data.split(" ");
	for (let i = 0; i<split.length; i++) {
		if (i == 0)
			cmd = split[i];
		else args.push(split[i]);
	}

	if (fs.existsSync(`./${cmddir}/${cmd}.js`))
		eval(`(async()=>{${fs.readFileSync(`./${cmddir}/${cmd}.js`)}})()`);
	else console.log("Unknown command");
});
