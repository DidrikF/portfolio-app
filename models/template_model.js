var mongoose = require('mongoose')
var Schema = mongoose.Schema


var TemplateSchema = mongoose.Schema({
  type: {
    type: String,
		required: [true, "Type is required"],
  },
  template: {
    type: Object,
  }
})  


var template = module.exports = mongoose.model('Template', TemplateSchema)

