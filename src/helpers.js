import uuidv4 from 'uuid/v4'

export function getId() {
    return uuidv4()
}

export const gridLayouts = {
    oneColumn: {
        'gridTemplateColumns': 'minmax(0, 1fr)',
        numColumns: 1 // not the best... as it does not express a 3D layout, need to update as some point
    },
    twoColumns: {
        'gridTemplateColumns': 'minmax(0, 1fr) minmax(0, 1fr)',
        numColumns: 2
    },
    threeColumns: {
        'gridTemplateColumns': 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
        numColumns: 3
    },
// add more layouts as needed, no need why you cant go 3D
}


export const quillItems = [
    { label:'Formats', type:'group', items: [
        { label:'Font', type:'font', items: [
            { label:'Sans Serif',  value:'sans-serif', selected:true },
            { label:'Serif',       value:'serif' },
            { label:'Monospace',   value:'monospace' }
        ]},
        { label:'Size', type:'size', items: [
            { label:'Small',  value:'small' },
            { label:'Normal', value:'normal', selected:true },
            { label:'Large',  value:'large' },
            { label:'Huge',   value:'huge' }
        ]},
        { label:'Alignment', type:'align', items: [
            { label:'', value:'', selected:true },
            { label:'', value:'center' },
            { label:'', value:'right' },
            { label:'', value:'justify' }
        ]},
        { label:'Header', type:'header', items: [
            { label:'H1', value: 1 },
            { label:'H2', value: 2 },
            { label:'H3', value: 3 },
            { label:'H4', value: 4 },
            { label:'Normal', value: false, selected: true }
        ]}
    ]},             
    { label:'Blocks', type:'group', items: [
        { type:'list', value:'bullet' },
        { type:'list', value:'ordered' }
    ]},
    
    { label:'Blocks', type:'group', items: [
        { type:'image', label:'Image' },
        { type:'video', label:'video' },
        { type:'formula', label:'formula' },
        { type:'code-block', label:'code-block' },
        { type:'link', label:'link' },
        { type:'sideimage', label:'Side Image' }, // Custom Button which I want to add custom functionality to
    ]}
]