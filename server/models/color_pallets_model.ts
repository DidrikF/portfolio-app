import * as mongoose from 'mongoose';

export interface IColorPallets extends mongoose.Document {
  owner: string,
  pallets: any[] // update, use type from platform types
}

const ColorPalletsSchema: mongoose.Schema = new mongoose.Schema({
	owner: {
    type: String,
    unique: true,
	},
  pallets: {
      type: Array,
  },
});

export const ColorPallets = mongoose.model<IColorPallets>('ColorPallets', ColorPalletsSchema);