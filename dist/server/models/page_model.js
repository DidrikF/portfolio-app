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
var PageSchema = new mongoose.Schema({
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
exports.Page = mongoose.model('Page', PageSchema);
//# sourceMappingURL=page_model.js.map