import * as mongoose from 'mongoose';


export interface IUser extends mongoose.Document {
	email: string,
	password: string,
	firstName: string,
	lastName: string,
	description?: string,
	image?: string
}

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


export const User = mongoose.model<IUser>('User', UserSchema);

