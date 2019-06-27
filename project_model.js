var mongoose = require('mongoose')
var Schema = mongoose.Schema


var ProjectSchema = mongoose.Schema({
	page_state: {
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
var project = module.exports = mongoose.model('Project', ProjectSchema)