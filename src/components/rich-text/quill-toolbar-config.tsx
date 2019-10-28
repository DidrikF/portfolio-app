
export interface ToolbarItem {
    type?: string;
    label?: string;
    value?: string;
    selected?: boolean;
    items?: any[];
    children?: JSX.Element[];
}


export const defaultColors = [
	'rgb(  0,   0,   0)', 'rgb(230,   0,   0)', 'rgb(255, 153,   0)',
	'rgb(255, 255,   0)', 'rgb(  0, 138,   0)', 'rgb(  0, 102, 204)',
	'rgb(153,  51, 255)', 'rgb(255, 255, 255)', 'rgb(250, 204, 204)',
	'rgb(255, 235, 204)', 'rgb(255, 255, 204)', 'rgb(204, 232, 204)',
	'rgb(204, 224, 245)', 'rgb(235, 214, 255)', 'rgb(187, 187, 187)',
	'rgb(240, 102, 102)', 'rgb(255, 194, 102)', 'rgb(255, 255, 102)',
	'rgb(102, 185, 102)', 'rgb(102, 163, 224)', 'rgb(194, 133, 255)',
	'rgb(136, 136, 136)', 'rgb(161,   0,   0)', 'rgb(178, 107,   0)',
	'rgb(178, 178,   0)', 'rgb(  0,  97,   0)', 'rgb(  0,  71, 178)',
	'rgb(107,  36, 178)', 'rgb( 68,  68,  68)', 'rgb( 92,   0,   0)',
	'rgb(102,  61,   0)', 'rgb(102, 102,   0)', 'rgb(  0,  55,   0)',
	'rgb(  0,  41, 102)', 'rgb( 61,  20,  10)',
].map(function(color){ return { value: color } });


export const quillItems: ToolbarItem[] = [
    {
        label: 'Formats',
        type: 'group',
        items: [
            {
                label: 'Font',
                type: 'font',
                items: [
                    {
                        label: 'Sans Serif',
                        value: 'sans-serif'
                    },
                    {
                        label: 'Serif',
                        value: 'serif'
                    },
                    {
                        label: 'Monospace',
                        value: 'monospace'
                    },
                    {
                        label: 'Roboto',
                        value: 'roboto',
                        selected: true
                    },
                ]
            },
            {
                label: 'Size',
                type: 'size',
                items: [
                    {
                        label: 'Small', value: 'small'
                    },
                    { label: 'Normal', value: 'normal', selected: true },
                    { label: 'Large', value: 'large' },
                    { label: 'Huge', value: 'huge' }
                ]
            },
            {
                label: 'Alignment', type: 'align', items: [
                    { label: '', value: '', selected: true },
                    { label: '', value: 'center' },
                    { label: '', value: 'right' },
                    { label: '', value: 'justify' }
                ]
            },
            {
                label: 'Header', type: 'header', items: [
                    { label: 'H1', value: 1 },
                    { label: 'H2', value: 2 },
                    { label: 'H3', value: 3 },
                    { label: 'H4', value: 4 },
                    { label: 'Normal', value: false, selected: true }
                ]
            }
        ]
    },
    {
        label: 'Blocks',
        type: 'group',
        items: [
            {
                type: 'list',
                value: 'bullet'
            },
            {
                type: 'list',
                value: 'ordered'
            }
        ]
    },

    {
        label: 'Blocks',
        type: 'group',
        items: [
            {
                type: 'bold',
                label: 'Bold'
            },
            {
                type: 'video',
                label: 'video'
            },
            {
                type: 'formula',
                label: 'formula'
            },
            {
                type: 'code-block',
                label: 'code-block'
            },
            {
                type: 'link',
                label: 'link'
            },
            {
                type: 'image',
                label: 'Image'
            },
            // { type:'sideimage', label:'Side Image' }, // Custom Button which I want to add custom functionality to
        ]
    }
]