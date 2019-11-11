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
const CSSDocumentSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: [true, "Owner is required"],
    },
    name: {
        type: String,
        required: [true, "Name is required"],
    },
    id: {
        type: String,
        required: [true, "Id is required"],
    },
    items: {
        type: Array,
        required: [true, "Items are required"],
    }
});
exports.CSSDocument = mongoose.model('CSSDocument', CSSDocumentSchema);
/* items has the following structure

 id: {
    type: string,
    required: true,
},
mediaQuery: {
    type: string,
    required: [true, "Media query is required"],
},
selector: {
    type: string,
    required: [true, "Selector is required"],
},
scopes: {
    type: object,
},
attributes: {
    type: object,
}

*/ 
//# sourceMappingURL=css_document_model.js.map