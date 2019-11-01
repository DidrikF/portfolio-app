import * as mongoose from 'mongoose';

export type UserDocument = import('../../types/platform_types').User & mongoose.Document;

var UserSchema: mongoose.Schema = new mongoose.Schema({
	email: {
		type: String,
		required: [true, "Email is required"],
		unique: true,
	},
	password: {
		type: String,
		required: [true, "Password is required"], //Is alleady a hash
		select: false,
	},
	firstName: {
		type: String,
		required: [true, "Email is required"],
	},
	lastName: {
		type: String,
		required: [true, "Email is required"],
	},
	description: {
		type: String,
	},
	image: {
		type: String,
	}
});


export const User = mongoose.model<UserDocument>('User', UserSchema);

