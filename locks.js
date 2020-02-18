// Functions //

function linSeq(s=1, p=1, len=10) {
	const r = [];

	for (let i = 0; i<len; i++) {
		r.push(s+(p*i));
	}

	return r;
}

function fibSeq(s=1, len=10) {
	const r = [s, s];

	for (let i = 0; i<len-2; i++) {
		let n = 0;

		if (r.length >= 2) {
			n += r[r.length-1]+r[r.length-2];
		}

		r.push(n);
	}

	return r;
}

// Locks //

const locks = {};

locks.rs_n = (tier=1)=>{
	const x = Math.floor(Math.random()*17)+1;
	const c = Math.floor(Math.random()*10)+1;

	let seq = [];
	seq = linSeq(x, c, 20);

	const n = Math.floor(Math.random()*(seq.length-5))+5;

	return {
		msg:`[${seq.slice(0, 5).join(", ")}, ...][${n}]`,
		ans: seq[n]
	}
};

locks.rs_f = (tier=1)=>{
	let alp = "abcdefghijklmnopqrstuvwxyz";
	let f = Math.floor(Math.random()*14)+2;
	if (tier == 2) {
		alp = [...alp].map(c=>alp.indexOf(c)%Math.floor(Math.random()*32)?c.toUpperCase():c).join("");
		f = Math.floor(Math.random()*5)+16;
	}
	return {
		msg: [...alp].map(c=>String.fromCharCode(c.charCodeAt(0)+f)).slice(0,6).join(""),
		ans: f
	}
}

locks.rs_colv = ()=>{
	const cols = {
		"R":"red",
		"G":"green",
		"B":"blue"
	}

	const c = Object.keys(cols)[Math.floor(Math.random()*Object.keys(cols).length)];

	return {
		msg:`¬${c}[+]¬*`,
		ans: cols[c]
	};
}

const ascii = {
	"sheep":[
		"      ¬W888888888   8888¬*¬p,¬*",
		"  ¬W88888888888888888888¬*¬p.¬*¬vo¬*¬p..¬*",
		" ¬W8888888888888888888¬* ¬p....¬*",
		"¬W88888888888888888888¬*",
		"¬W8888888888888888888¬*",
		"   ¬W8888       8888¬*",
		"    ¬p,,         ,,¬*",
	].join("\n"),
	"smile":[
		"     ¬W.  .¬*",
		"       ¬p>¬*",
		"    ¬r.    .¬*",
		"     ¬r....¬*"
	].join("\n"),
	"balloon":[
        "    ¬R____¬*",
        "   ¬R'    '¬*",
        "  ¬R'      '¬*",
        "  ¬R'      '¬*",
        "   ¬R'____'¬*",
        "      ¬W'¬*",
        "       ¬W'¬*",
        "       ¬W'¬*",
        "        ¬W'¬*",
        "        ¬W'¬*",
        "         ¬W.¬*"
	].join("\n"),
	"tree":[
        "     ¬g______¬*",
        "    ¬g'      '¬*",
    	"   ¬g'        '¬*",
        "    ¬g'______'¬*",
        "      ¬o'  '¬*",
        "      ¬o'  '¬*",
        "      ¬o'  '¬*",
        "     ¬o'____'¬*"
	].join("\n")
}

locks.rs_asc = ()=>{
	const ak = Object.keys(ascii);

	const ans = ak[Math.floor(Math.random()*ak.length)];

	return {
		msg: ascii[ans],
		ans
	}
}

locks.ss_con = (ct=6, l, ret, args, arg)=>{
	if (ct) {
		const state = {};

		let tpl = [..."RrGBbyo"];
		state.types = {};
		state.nodes = [];

		for (let i = 0; i<ct; i++) {
			const x = Math.floor(Math.random()*tpl.length);
			const t = tpl[x];
			tpl.splice(x, 1);

			const tk = Object.keys(state.types);

			if (i == 3)
				state.types[tk[0]] = t;
			if (i == 0)
				state.types[t] = null;
			else {
				state.types[t] = tk[i-1];
			}
		}

		const tk = Object.keys(state.types);

		for (let i = 0; i<ct; i++) {
			state.nodes.push({
				col: tk[Math.floor(Math.random()*tk.length)]
			});
		}

		return {
			lockfunc:true,
			state
		}
	}

	let s = "";

	let f = true;
	const tk = Object.keys(l.state.types);

	ch: if (args[arg]) {
		const c = args[arg];
		if (!l.state.nodes[c]) break ch;
		let nx = tk[tk.indexOf(l.state.nodes[c].col)+1];
		if (nx)
			l.state.nodes[c].col = nx;
		else
			l.state.nodes[c].col = tk[0];
	}

	for (let i = 0; i<l.state.nodes.length; i++) {
		const t = l.state.nodes[i];
		s += `¬${t.col}${i}¬*`;

		s += "¬"
		let nn = l.state.nodes[i+1];
		if (!f) {
			s += "R...¬*";
			continue;
		}
		if (!nn) {
			s += "g...¬*";
			continue;
		}
		if (nn.col == l.state.types[t.col])
			s += "g";
		else {
			f = false;
			s += "r";
		}
		s += "...¬*";
	}
	s += "¬vO¬*"

	const r = {
		msg: `${s} ¬${f?"gONLINE":"rOFFLINE"}¬*`
	}

	if (f)
		l.armed = false;

	return r
}

const numascii = [
    [
        " .%%%%.   ",
        " %    %   ",
        " %    %   ",
        " %    %   ",
        " %    %   ",
        " .%%%%.   "
    ],
    [
        "  %%%%    ",
        " %%%%%    ",
        "   %%%    ",
        "   %%%    ",
        "   %%%    ",
        "  %%%%%   "
    ],
    [
        "  %%%%%   ",
        " %%   %%  ",
        "  %  %%   ",
        "    %%    ",
        "   %%     ",
        " %%%%%%%  "
    ],
    [
        "  %%%%%   ",
        " %%   %%  ",
        "     %%   ",
        " %%   %%  ",
		"  %%%%%   ",
		"          "
    ],
    [
        "   .%%%%  ",
        "  %%   %% ",
        "  %%   %% ",
        " %%%%%%%% ",
        "       %% ",
        "   \t   %% "
    ],
    [
        " %%%%%%   ",
        " %        ",
        " %%%%.    ",
        "    \t%    ",
        "    \t%    ",
        " %%%%%    "
    ],
    [
        " \t.%%%    ",
        " \t%       ",
        " \t%%%%    ",
        "  %   %    ",
		" \t%%%.    ",
		"           "
    ],
    [
        "  %%%%%%. ",
        " \t    %%  ",
        "     %%   ",
        "    %%    ",
        "   %%     ",
        "  .%      "
    ],
    [
        " .%%.     ",
        " %  %     ",
        " .%%.     ",
        " %  %     ",
		" .%%.     ",
		"          "
    ],
    [
        " .%%%%.   ",
        " %    %   ",
        " .%%%%.   ",
        " \t   %    ",
        "     %.   ",
        "   %.     "
    ]
];
locks.ss_asc = ()=>{
	const chars = "#$%&+=?@";
	const spchars = "​".repeat(10)+".";
	const cols = "RrGgBbyoPpVv?";

	let n = Math.floor(Math.random()*19000)+1000;

	let s = [];
	for (const ch of n.toString()) {
		const asc = numascii[ch];
		for (let i = 0; i<asc.length; i++) {
			if (!s[i]) s[i] = "";
			s[i] += `¬${cols[Math.floor(Math.random()*cols.length)]}${asc[i].replace(/%/g, chars[Math.floor(Math.random()*chars.length)])}¬*`;
		}
	}

	s = s.join("\n");

	while (s.includes(" ")) {
		s = s.replace(" ", spchars[Math.floor(Math.random()*spchars.length)]);
	}

	/*let ct = Math.floor(Math.random()*3)+1;
	for (let i = 0; i<ct; i++)
		s = s.replace("    ", "\t")*/

	return {
		msg: s,
		ans: n
	}
}

locks.ss_n = ()=>{
	const x = Math.floor(Math.random()*17)+1;

	let seq = [];
	seq = fibSeq(x, 8);

	const n = Math.floor(Math.random()*(seq.length-5))+5;

	return {
		msg:`[${seq.slice(0, 5).join(", ")}, ...][${n}]`,
		ans: seq[n]
	}
}

locks.ss_f = ()=>{
	let alp = "abcdefghijklmnopqrstuvwxyz";
	alp += alp.toUpperCase();
	let f = Math.floor(Math.random()*5)+16;
	return {
		msg: [...alp].map(c=>alp.indexOf(c)%Math.floor(Math.random()*32)?c.toUpperCase():c).map(c=>String.fromCharCode(c.charCodeAt(0)+f)).slice(0,6).join(""),
		ans: f
	}
}

locks.ss_colv = ()=>{
	const cols = {
		"w":"white",
		"R":"red",
		"G":"green",
		"B":"blue",
		"y":"yellow",
		"o":"orange",
		"P":"pink"
	};

	let r = Object.keys(cols);
	const s = r[Math.floor(Math.random()*r.length)];
	return {
		msg: r.map(c=>"¬"+c+(c==s?"+":"-")+"¬*").sort(()=>Math.random()-Math.random()).join(""),
		ans: cols[s]
	};
}

const elements = [
	"H",
	"He",
	"Li",
	"Be",
	"B",
	"C",
	"N",
	"O",
	"F",
	"Ne",
	"Na",
	"Mg",
	"Al",
	"Si",
	"P",
	"S",
	"Cl",
	"Ar",
	"K",
	"Ca",
	"Sc",
	"Ti",
	"V",
	"Cr",
	"Mn",
	"Fe",
	"Co",
	"Ni",
	"Cu",
	"Zn",
	"Ga",
	"Ge",
	"As",
	"Se",
	"Br",
	"Kr",
	"Rb",
	"Sr",
	"Y",
	"Zr"
];

locks.ss_m = ()=>{
	const e = elements[Math.floor(Math.random()*elements.length)];
	const num = elements.indexOf(e)+1;
	return {
		msg: e,
		ans: num
	}
}

locks.gs_m = ()=>{
	const e = elements[Math.floor(Math.random()*elements.length)];
	let num = elements.indexOf(e)+1;

	/*let ec = "";
	if (num>=2) {
		ec = "2";
		num -= 2;
	}
	while (num > 8) {
		num -= 8;
		ec += ".8";
	}
	if (num) {
		if (ec) ec += ".";
		ec += `${num}`;
	}*/

	return {
		msg: `Need symbol: ${num.toString()}`,
		ans: e
	}
}

const gs_rep = {
	"B":"BL1SS",
	"R":"atrox",
	"y":"tzaeru",
	"o":"rocket",
	"b":"winter",
	"p":"sammy",
	"w":"spark"
};
locks.gs_rep = ()=>{
	const rk = Object.keys(gs_rep);
	const x = Math.floor(Math.random()*rk.length);
	const v = gs_rep[rk[x]];

	return {
		msg: `¬b[8](ZD)¬* ¬${rk[x]}${[...v].map(c=>"?").join("")}¬*`,
		ans: v
	}
}

module.exports = exports = locks;