import { getId } from './helpers';


export const gridLayouts = {
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


/*

export function getPageWidth(numberOfColumns, defaultPadding) {
    const containerElement = document.getElementsByClassName('Page')[0]
    if (!containerElement) return false

    const width = containerElement.offsetWidth
    const innerWidth = width - 2*parseInt(defaultPadding, 10)
    return innerWidth / numberOfColumns
}



// Want to have it dynamically adjust and have quill respect the boundaries of the grid
export function updateSectionWidths(sectionUpdate, sectionIndex) {
    const activePage = this.getActivePageIndexFromPath(window.location.hash.replace("#", ""))
    // console.log("active page: ", this.getActivePageIndexFromPath(window.location.hash.replace("#", "")))
    if (!activePage) return
    
    this.setState((state, props) => {
        
        for (let key in sectionUpdate) {
            if ((key === 'innerWidth') || (key === 'columnWidth')) {
                // loop over grid sections and update the values
                // console.log("Pages: ", state.pages[activePage])
                // console.log("SectionUpdate: ", sectionUpdate)
                // console.log("sectionIndex: ", sectionIndex)

                let gridSections = state.pages[activePage].sections[sectionIndex].gridSections // need to reference the active page, not the one being edited.
                state.pages[activePage].sections[sectionIndex].gridSections = gridSections.map(gridSection => {
                    if (gridSection.coordinates[1] === 1) {
                        gridSection = update(gridSection, {style: {width: {$set: sectionUpdate['innerWidth']}}})

                    } else if (gridSection.coordinates[1] === 2) { // only the second "row" has dynamic width
                        gridSection = update(gridSection, {style: {width: {$set: sectionUpdate['columnWidth']}}})
                    } 
                    return gridSection
                })
                continue
            }
            state.pages[activePage].sections[sectionIndex][key] = sectionUpdate[key] // replaced be merge for deep assignment
        }

        return {
            pages: state.pages
        }
    })
}

*/