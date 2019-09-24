var mongoose = require('mongoose')
var Schema = mongoose.Schema


var PageSchema = mongoose.Schema({
  owner: {
    type: String,
    required: [true, "Owner is required"],
  },
  style: {
    type: Object,
  },
  type: {
    type: String,
  },
  path: {
    type: String,
  },
  pathTitle: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
  },
  className: {
    type: String,
  },
  styleInput: {
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