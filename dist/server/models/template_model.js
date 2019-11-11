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
var TemplateSchema = new mongoose.Schema({
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
        type: Object,
    }
});
exports.Template = mongoose.model('Template', TemplateSchema);
//# sourceMappingURL=template_model.js.map