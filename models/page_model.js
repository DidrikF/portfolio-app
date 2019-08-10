var mongoose = require('mongoose')
var Schema = mongoose.Schema


var PageSchema = mongoose.Schema({
  style: {
    type: Object,
  },
  className: {
    type: String,
  },
  styleInput: {
    type: String,
  },
  type: {
    type: String,
  },
  title: {
    type: String,
  },
  sections: {
    type: Array,
  },
  show: {
    type: Boolean,
  }

})
var page = module.exports = mongoose.model('Page', PageSchema)