function GenerateToken(message) {
  	const utf8encoder = new TextEncoder();
  	const rb = utf8encoder.encode(message);
  	let r = '';
  	for (const b of rb) {
    	r += ('0' + b.toString(16)).slice(-2);
  	}
  	return r;
}

function Detoken(token) {
	return decodeURIComponent(
    	token.replace(/\s+/g, '') // remove spaces
    	.replace(/[0-9a-f]{2}/g, '%$&') // add '%' before each 2 characters
  	);
}

let key = Detoken("49502d3a3a317c54696d652d313635373238343537383533323630303030")
key = key.split("|")
let ip = key[0].split("-")[1]
let time = Number(key[1].split("-")[1])

const timeleft = new Date(time)
console.log(timeleft)
let checktime = timeleft - Date.now() >= timeleft || timeleft - Date.now() <= 0
=======
function GenerateToken(message) {
  	const utf8encoder = new TextEncoder();
  	const rb = utf8encoder.encode(message);
  	let r = '';
  	for (const b of rb) {
    	r += ('0' + b.toString(16)).slice(-2);
  	}
  	return r;
}

function Detoken(token) {
	return decodeURIComponent(
    	token.replace(/\s+/g, '') // remove spaces
    	.replace(/[0-9a-f]{2}/g, '%$&') // add '%' before each 2 characters
  	);
}

let key = Detoken("49502d3a3a317c54696d652d313635373238343537383533323630303030")
key = key.split("|")
let ip = key[0].split("-")[1]
let time = Number(key[1].split("-")[1])

const timeleft = new Date(time)
console.log(timeleft)
let checktime = timeleft - Date.now() >= timeleft || timeleft - Date.now() <= 0
console.log(checktime)