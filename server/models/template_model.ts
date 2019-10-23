import * as mongoose from 'mongoose';

type TemplateDocument = import('../../types/platform_types').Template & mongoose.Document;

var TemplateSchema: mongoose.Schema = new mongoose.Schema({
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
});


export const Template = mongoose.model<TemplateDocument>('Template', TemplateSchema);

