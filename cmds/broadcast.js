(async(pl, sys, args, flags)=>{
	let msg = [];
	for (let i = 0; i<args.length; i++) {
		msg.push(args[i]);
	}
	msg = msg.join(" ");
	if (msg.length > 128)
		return "Message is too long. Maximum 128 chars.";
	if(!msg)
		return "Usage: broadcast [message]"
	game.systems.broadcast(sys, msg);
	return "";
})
