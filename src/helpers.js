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
