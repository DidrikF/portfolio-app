import * as mongoose from 'mongoose';

var PageSchema: mongoose.Schema = new mongoose.Schema({
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

});

export const Page = mongoose.model('Page', PageSchema);