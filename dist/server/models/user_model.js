"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = __importStar(require("mongoose"));
var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
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
exports.User = mongoose.model('User', UserSchema);
//# sourceMappingURL=user_model.js.map