'use strict';
const https = require("https"),
http = require("http"),
util = require("util"),
{Stream} = require("stream")

function slurp(strm, encoding='utf-8') {
	if(encoding === true || encoding === false) {
		process.emitWarning("Use of boolean for 'encoding' -- please use 'utf-8/'raw' instead.", "DeprechationWarning")
		encoding = encoding ? 'raw' : "utf-8"
	}
	return new Promise( (resolve, reject) => {
		if(!(strm instanceof Stream)) {
			reject(new TypeError("strm was not a Stream."))
		}
		let buffer;
		strm.on('error', err => reject(err))
		strm.on('data', chunk => {
			if(buffer === undefined)
				buffer = chunk
			else  {
				buffer = Buffer.concat([buffer, chunk])
			}
		})
		strm.on('end', () => {
			if(buffer === undefined)
				buffer = Buffer.alloc(0)
			if(encoding == "raw" || encoding == "buffer")
				resolve(buffer)
			else {
				resolve(buffer.toString(encoding))
			}
		})
	})
}

function request(req, in_data, encoding) {
	return new Promise( (resolve, reject) => {
		let out = https.request(req, (repl) => resolve(msgToObj(repl, encoding)))
		out.on('error', (err) => reject(err))
		out.end(in_data)
	})
}

function requestInsecure(req, in_data, encoding) {
	return new Promise((resolve, reject) => {
		let out = http.request(req, (repl) => resolve(msgToObj(repl, encoding)))
		out.on('error', (err) => reject(err))
		out.end(in_data)
	})
}

async function msgToObj(msg, encoding='utf-8') {
	return {
		data:        await slurp(msg, encoding),
		headers:     msg.headers,
		httpVersion: msg.httpVersion,
		method:      msg.method,
		rawHeaders:  msg.rawHeaders,
		rawTrailers: msg.rawTrailers,
		code:        msg.statusCode,
		message:     msg.statusMessage,
		trailers:    msg.trailers,
		url:         msg.url,
		socket:      msg.socket,
		connection:  msg.connection,
		toString: function() {
			return `${this.method} ${this.url};${this.data}`
		}
	}
}

const sleep = util.promisify(setTimeout)

module.exports = {
	slurp,
	request,
	requestInsecure,
	msgToObj,
	sleep
}
