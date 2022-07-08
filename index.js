let {db, tk} = require("./Data/config.json")
// Function
function GetIp(req) {
	return req.headers["x-forwarded-for"] || req.connection.remoteAddress
}
// Main
// Encrypt And Decrypt

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

function ConvertToBase64(token) {
	return Buffer.from(token).toString('base64')
}

function ConvertBase64ToHex(base) {
	return Buffer.from(base, 'base64').toString('ascii')
}

function Hash(msg) {
	return require('crypto').createHash('sha512').update(msg).digest('hex')
}
//--------------------------------------------
const Data = require("./Data/Data")
const express = require("express")
const bodyParser = require("body-parser")
const {verify} = require("hcaptcha")
const mongoose = require("mongoose")
const ms = require("ms")

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'ejs')
app.use("/assets",express.static("assets"))

app.get("/", (req, res, next) => {
	res.render("home", {key: tk})
	next()
})

app.get("/getscript", (req, res, next) => {
	res.render("getscript")
	next()
})

app.get("/error", (req, res, next) => {
	res.render("bypassDetected")
})

app.get("/gen", async(req, res) => {
	let {cp} = req.query
	let data = await Data.findOne({Ip: GetIp(req)})
	if (data) {
		if (!data.Checkpoint1) {
			return res.render("redirect", {cp: cp})
		}
		if (!data.Checkpoint2) {
			return res.render("redirect", {cp: cp})
		}
		return
	}
	return res.redirect("/")
})

app.post("/gen", async(req, res) => {
	let {cp, referrer} = req.body
	if (!referrer || referrer == "" || referrer != "https://linkvertise.com/") {
		return res.json({err: true})
	}
	let data = await Data.findOne({Ip: GetIp(req)})
	if (cp == 2) {
		if (!data) {
			return res.redirect("/")
		}
		if (!data.Checkpoint1) {
			try {
				data.Checkpoint1 = true
				data.UrlSolved = `${GenerateToken("alone-hub-checkpoint-2" + "|" + Date.now().toString())}`
				await data.save()
				return res.json({newUrl: "/getkey"})
			} catch(err) {
				return res.json({err: true})
			}
		}
	}
	if (cp == 3) {
		if (!data) {
			return res.redirect("/")
		}
		if (!data.Checkpoint2) {
			try {
				data.Checkpoint2 = true
				data.IsGenerate = true
				data.TimeGenerate = Date.now() + ms("24h")
				data.KeyCode = `${GenerateToken("IP-" + data.IP + "|" + "Time:" + Date.now())}`
				await data.save()
				return res.json({newUrl: "/getkey"})
			} catch(err) {
				console.log(err)
				return res.json({err: true})
			}
		}
	}
})

// app.get("/genkey", async(req, res) => {
// 	let {token} = req.query
// 	token = Detoken(token)
// 	console.log(token)
// 	let data = await Data.findOne({IP: GetIp(token)})
// 	if (data) {
// 		return res.render("genkey", {key: data.KeyCode})
// 	}
// 	return res.redirect("/getkey")
// })

app.get("/redirect", async(req ,res) => {
	let {url} = req.query
	if (!url) {
		return res.redirect("/")
	}
	url = Detoken(url)
	url = url.split("|")
	try {
		return res.redirect(`https://link-hub.net/396241/${url[0]}`)
	} catch(err) {
		return res.redirect("/")
	}
})

// app.post("/redirect", async(req, res) => {
// 	let {referrer} = req.body
// 	if (referrer == "" || referrer == null || referrer == undefined || referrer != "https://linkvertise.com/") {
// 		return res.redirect("/")
// 	}
// 	let data = await Data.findOne({IP: GetIp(req)})
// 	if (!data) {
// 		return res.redirect("/")
// 	}
// 	return res.json({url: `${data.UrlSolved}`})
// })

app.get("/getkey", async (req, res, next) => {
	let data = await Data.findOne({IP: GetIp(req)})
	if (!data) {
		console.log("new data")
		data = new Data({
			IP: GetIp(req),
			UrlSolved: `${GenerateToken("alone-hub-checkpoint-1" + "|" + Date.now().toString())}`
		})
		try {
			await data.save()
			return res.render("getkey", {ip: GenerateToken(data.IP),checkpoint: 1, token: tk})
		} catch(err) {
			return res.redirect("/")
		}
		return
	}
	const timeleft = new Date(data.TimeGenerate)
	let checktime = timeleft - Date.now() >= timeleft || timeleft - Date.now() <= 0
	if (data.IsGenerate && checktime) {
		data.IsGenerate = false
		data.KeyCode = ""
		data.Checkpoint1 = false
		data.Checkpoint2 = false
		data.TimeGenerate = 0
		try {
			await data.save()
			return res.render("getkey", {ip: GenerateToken(data.IP), checkpoint: 1, token: tk})
		} catch(err) {
			return res.redirect("/")
		}
	}
	if (!checktime || data.IsGenerate) {
		return res.render("genkey", {key: data.KeyCode})
	}
	if (!data.Checkpoint1) {
		return res.render("getkey", {ip: GenerateToken(data.IP), checkpoint: 1, token: tk})
	}
	if (!data.Checkpoint2) {
		return res.render("getkey", {ip: GenerateToken(data.IP), checkpoint: 2, token: tk})
	}
	next()
})

app.get("/validate", async(req, res) => {
	let {key, gameId} = req.query
	key = ConvertBase64ToHex(key)
	key = Detoken(key)
	let keyCheck
	let token
	try {
		keyCheck = key.split("|")[0]
		token = key.split("|")[1]
	} catch(err) {
		console.log(err)
		return res.send(JSON.stringify({message: "Invalid Key!", status: 404}))
	}
	let data = await Data.findOne({KeyCode: keyCheck})
	if (!data) {
		return res.send(JSON.stringify({message: "This key doesn't exist!", status: 404}))
	}
	if (GetIp(req) != data.IP) {
		return res.send(JSON.stringify({message: "Invalid Key!", status: 404}))
	}
	const timeleft = new Date(data.TimeGenerate)
	let checktime = timeleft - Date.now() >= timeleft || timeleft - Date.now() <= 0
	if (data.IsGenerate && checktime) {
		data.IsGenerate = false
		data.KeyCode = ""
		data.Checkpoint1 = false
		data.Checkpoint2 = false
		data.TimeGenerate = 0
		try {
			await data.save()
			return res.send(JSON.stringify({message: "The key has expired!", status: 404}))
		} catch(err) {
			return res.send(JSON.stringify({message: "Error!", status: 404}))
		}
	}
	let reToken = GenerateToken(token + "ALONEHUB" + "ALONEWINNING" + keyCheck)
	reToken = Hash(reToken)
	return res.send(JSON.stringify({message: reToken, status: 200}))
})

app.get("/delete", async(req, res) => {
	await Data.deleteMany({})
	return res.redirect("/")
})

app.post("/getkey", async(req, res, next) => {
	let token = req.body["h-captcha-response"];
	let {ip} = req.body
	if (!ip) {
		return
	}
	ip = Detoken(ip)
	let dataU = await Data.findOne({IP: ip})
	if (!dataU) {
		return
	}
	verify("0x0000000000000000000000000000000000000000", token)
	.then((data) => {
		if (data.success == true) {
			return res.json({UrlSolved: dataU.UrlSolved})
		} else {
			res.render("failed", {url: req.protocol + "://" + req.get("host")})
			next()
		}
	}).catch((err) => {
		throw err
	})
})

let port = 3000 || process.env.PORT

app.listen(port, () => {
	console.log("[HOST] Ready")
	if(!mongoose.connections[0].client) {
        mongoose.connect(db, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        },{server: { auto_reconnect: true }}).then(() => {
        	console.log("[Data] Ready")
        })
    }
})