var mongoose = require('mongoose')
var Schema = mongoose.Schema


var PageSchema = mongoose.Schema({
	state: {
		type: Object,
	},
	title: {
		type: String,
    }, 
    description: {
		type: String,
    },
    show: {
        type: Boolean
    }
})
var page = module.exports = mongoose.model('Page', PageSchema)