import * as mongoose from 'mongoose';

const CSSDocumentSchema: mongoose.Schema = new mongoose.Schema({
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

export const CSSDocument = mongoose.model('CSSDocument', CSSDocumentSchema);


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