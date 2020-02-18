module.exports = exports = {
	"breach":`After an investigation, we have discovered a data breach on one of our servers.
The culprit deleted our meme dumps. This is a tragedy, but we will recover.
We are working on installing better security for our servers.`,
	get "to_fix"(){
		const s = ["Tzaeru", "Atrox", "Winter"];
		const u = s[Math.floor(Math.random()*s.length)];
		return `Hello, this is important.
${u} is having issues with server #35.
Please get this diagnosed ASAP.`},
	"pwd":`Hello again.
Please set your passwords to something other than password.
Thank you.`,
	"catastrophic_failure":`What do I even pay you morons for?
All of our data has been exposed. This is embarassing.`,
	"remndr":`Hello. Sadly, we won't be announcing EOTY this year.
We simply couldn't make a choice. You're all equally as useless.`,
	"todo.txt":`TODO: Announce maintenance
SHIT! I forgot to do this. Now we're being flooded with support tickets.`
}