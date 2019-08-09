var mongoose = require('mongoose')
var Schema = mongoose.Schema


var ColorPalletsSchema = mongoose.Schema({
	owner: {
		type: String,
	},
  pallets: {
      type: Array,
  },
})
var colorPallets = module.exports = mongoose.model('ColorPallets', ColorPalletsSchema)