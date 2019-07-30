
export const quillItems = [
    { label:'Formats', type:'group', items: [
        { label:'Font', type:'font', items: [
            { label:'Sans Serif',  value:'sans-serif' },
            { label:'Serif',       value:'serif' },
            { label:'Monospace',   value:'monospace' },
            { label:'Roboto',   value:'roboto', selected:true},
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
        { type:'bold', label:'Bold' },
        { type:'video', label:'video' },
        { type:'formula', label:'formula' },
        { type:'code-block', label:'code-block' },
        { type:'link', label:'link' },
        { type:'image', label:'Image' },
        { type:'sideimage', label:'Side Image' }, // Custom Button which I want to add custom functionality to
    ]}
]