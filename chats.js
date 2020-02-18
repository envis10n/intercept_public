const chats = {};

chats.send = (chat, user, msg)=>{
	game.clients.filter(c=>c.player&&chat.users.includes(c.player)).forEach(c=>c.send({
		event: "chat",
		msg: `¬b(${chat.id})¬* ¬${chat.admin==user?"r":"b"}${user}:¬* ${msg}`
	}));
}

module.exports = chats;