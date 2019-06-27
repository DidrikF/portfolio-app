var mongoose = require('mongoose')
var Schema = mongoose.Schema


var UserSchema = mongoose.Schema({
	email: {
		type: String,
		required: [true, "Email is required"],
		unique: true,
	},
	password: {
		type: String,
		required: [true, "Password is required"], //Is alleady a hash
		select: false,
	}
})  


var user = module.exports = mongoose.model('User', UserSchema)

