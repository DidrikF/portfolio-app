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
const ColorPalletsSchema = new mongoose.Schema({
    owner: {
        type: String,
        unique: true,
    },
    pallets: {
        type: Array,
    },
});
exports.ColorPallets = mongoose.model('ColorPallets', ColorPalletsSchema);
//# sourceMappingURL=color_pallets_model.js.map