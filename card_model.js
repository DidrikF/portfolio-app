var mongoose = require('mongoose')
var Schema = mongoose.Schema


var CardSchema = mongoose.Schema({
	title: {
		type: String,
	},
    description: {
        type: String,
    },
    technologies: {
        type: Array,
    }, 
    image: {
        type: String,
    }
})
var card = module.exports = mongoose.model('Card', CardSchema)