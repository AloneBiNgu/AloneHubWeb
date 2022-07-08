const mongoose = require('mongoose');

const WhiteListSchema = new mongoose.Schema({
	IP: {
		type: String,
		default: ""
	},
	Checkpoint1: {
		type: Boolean,
		default: false
	},
	Checkpoint2: {
		type: Boolean,
		default: false
	},
	UrlSolved: {
		type: String,
		default: ""
	},
	IsGenerate: {
		type: Boolean,
		default: false
	},
	KeyCode: {
		type: String,
		default: ""
	},
	TimeGenerate: {
		type: Date,
		default: 0
	}
})

=======
const mongoose = require('mongoose');

const WhiteListSchema = new mongoose.Schema({
	IP: {
		type: String,
		default: ""
	},
	Checkpoint1: {
		type: Boolean,
		default: false
	},
	Checkpoint2: {
		type: Boolean,
		default: false
	},
	UrlSolved: {
		type: String,
		default: ""
	},
	IsGenerate: {
		type: Boolean,
		default: false
	},
	KeyCode: {
		type: String,
		default: ""
	},
	TimeGenerate: {
		type: Date,
		default: 0
	}
})

>>>>>>> 1f2b141 (cak)
module.exports = mongoose.model("DataUser", WhiteListSchema)