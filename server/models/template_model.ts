import * as mongoose from 'mongoose';

import { Page, Section, GridSection, Component } from '../../types/platform_types';

export interface ITemplate extends mongoose.Document {
  owner: import('../../types/basic-types').Email,
  title: string,
  type: string,
  template: Page | Section | GridSection | Component,
}

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


export const Template = mongoose.model('Template', TemplateSchema);

