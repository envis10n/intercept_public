// Modules //

const crypto = require("crypto");

// Lib //

const lib = {};

lib.gen = (len=6)=>{
	let ch = "abcdefghijklmnopqrstuvwxyz";
	ch += ch.toUpperCase()+"0123456789";
	let s = "";
	for (let i = 0; i<len; i++) s += ch[Math.floor(Math.random()*ch.length)];
	return s;
}

lib.gen_hex = (len=4)=>{
	const hx = "0123456789abcdef"
	let s = "";
	for (let i = 0; i<len; i++)
		s += hx[Math.floor(Math.random()*hx.length)];
	return s;
}

lib.gen_hash = (tohash, salt=lib.gen(32))=>{
	const hmac = crypto.createHmac("sha512", salt);
	hmac.update(tohash);
	return hmac.digest("hex");
}

lib.junk = len=>{
	let r = "";
	for (let i = 0; i<len; i++)
		r += String.fromCharCode(Math.floor(Math.random()*500)+500);
	return r;
}
lib.corrupt = (s, ct=Math.floor(Math.random()*2)+1)=>{
	s = s.split("");
	for (let i = 0; i<ct+1; i++) {
		let ix = Math.floor(Math.random()*s.length);
		const crc = Math.floor(Math.random()*2);
		let cs = "";
		for (let x = ix; x<ix+crc; x++)
			if (s[x])
				cs += s[x];
		s.splice(ix, crc)
		s[ix] = `¬?${lib.shuffle(cs)}¬*`;
	}
	return s.join("");
}

lib.explode = (str="")=>{
	return [...str].map(s=>lib.shuffle(parseInt(s.charCodeAt(0)).toString(2))).join("")
}

lib.compare = (i1, i2)=>{
	if (!i1) return false;
	if (!i2) return false;

	if (i1.length != i2.length) return false;

	let r = true;
	for (let i = 0; i<i1.length; i++)
		if (r && i1[i]!=i2[i]) r = false;
	return r;
}

lib.valid_login = (user, pass)=>{
	const ur = /[^_a-zA-Z0-9]/;

	// Validation for both values //
	let o = {username:user, password:pass};
	for (const p in o) {
		if (!o[p])
			return {success:false, error:`No ${p} provided.`};   
		if (typeof o[p] != "string")
			return {success:false, error:`Invalid ${p}.`};
	}

	// Username validation //
	if (user.length > 30)
		return {success:false, error:"Username is too long."};
	if (ur.test(user))
		return {success:false, error:"Invalid username."};
	
	// Password validation //
	if (pass.length > 255)
		return {success:false, error:"Password is too long."};
	if (pass.length < 1)
		return {success:false, error:"Password is too short."};

	return {success:true};
}

lib.shuffle = (ar)=>{
	let j = false;
	if (typeof ar == "string") {
		j = true;
		ar = ar.split("");
	}

	ar = ar.sort(()=>Math.random()>Math.random());

	return j?ar.join(""):ar;
}

lib.select = (ar=[], ct, pl=true)=>{
	if (ct == undefined) ct = Math.floor(Math.random()*(ar.length+1));

	const r = [];
	const p = [...ar];

	for (let i = 0; i<ct; i++) {
		if (!p.length) p = [...ar];

		const idx = Math.floor(Math.random()*p.length);

		r.push(p[idx]);

		if (pl) p.splice(idx, 1);
	}

	return r;
}

module.exports = exports = lib;
