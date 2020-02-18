// Modules //

const fs = require("fs"),
rethinkdbdash = require("rethinkdbdash"),
{slurp} = require("./async_helpers")

// Database //

const db = {};

db.r = rethinkdbdash({
	discovery: true,
	silent: true
});

// Functions //

db.get = async (table, id)=>{
	return await db.db.table(table).get(id);
};

db.set = async (table, id, val)=>{
	val.id = id;
	if (await db.db.table(table).get(id) == null)
	await db.db.table(table).insert(val);
	else await db.db.table(table).get(id).replace(val);
}

db.filter = async (f, table)=>{
	if (table) return await db.db.table(table).filter(f);
	else {
		const r = [];
		game.cfg.db.tables.forEach(async t=>{
			const fl = await db.db.table(t).filter(f);
			r.push(...fl);
		});
		return r;
	}
}

db.delete = async (table, id)=>{
	return await db.db.table(table).get(id).delete();
};

// Exports //

module.exports = db;
