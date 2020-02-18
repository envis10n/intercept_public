(async(pl, sys, args, flags)=>{
	return `[${sys.ip}]
OS: SigmaOS
Uptime: ${Math.floor((Date.now()-pl.last_login)/1000)}s
CPU: ${game.systems.hardware.CPUs[sys.hardware.cpu]||"UNKNOWN"}
RAM: ${sys.hardware.ram} GB`;
});