var mongoose = require('mongoose')
var Schema = mongoose.Schema


var TemplateSchema = mongoose.Schema({
  owner: {
    type: String,
    required: [true, "Owner is requered"],
  },
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  type: {
    type: String,
		required: [true, "Type is required"],
  },
  template: {
    type: Object, // page, section, gridSection, component
  }
})  


var template = module.exports = mongoose.model('Template', TemplateSchema)

