export interface GridSection {
    className: string,
    coordinates: [number, number]
}

export interface Grid {
    className: string,
    numColumns: number,
    layoutName: string,
    gridSections: GridSection[]
}


export interface GridLayouts {
    [key: string]: Grid
}

export const gridLayouts: GridLayouts = {
    Grid_1_1: {
        className: "Grid_1_1",
        numColumns: 1,
        layoutName: "One column",
        gridSections: [
            {
                className: "GridSection_1_1_1_1",
                coordinates: [1, 1],
            }
        ],
    },
    Grid_1_2: {
        className: "Grid_1_2",
        numColumns: 2,
        layoutName: "Two columns",
        gridSections: [
            {
                className: "GridSection_1_2_1_1",
                coordinates: [1, 1],
            },
            {
                className: "GridSection_1_2_1_2",
                coordinates: [1, 2],
            }
        ]
    },
    Grid_1_3: {
        className: "Grid_1_3",
        numColumns: 3,
        layoutName: "Tree columns",
        gridSections: [
            {
                className: "GridSection_1_3_1_1",
                coordinates: [1, 1],
            },
            {
                className: "GridSection_1_3_1_2",
                coordinates: [1, 2],
            },
            {
                className: "GridSection_1_3_1_3",
                coordinates: [1, 3],
            }
        ]
    },
}
