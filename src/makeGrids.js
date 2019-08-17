import { getId } from './helpers';

class GridSectionFactory {
    constructor () {

    }

    getPageWidth(numberOfColumns, defaultPadding) {
        const containerElement = document.getElementsByClassName('Page')[0]
        if (!containerElement) return false

        const width = containerElement.offsetWidth
        const innerWidth = width - 2*parseInt(defaultPadding, 10)
        return innerWidth / numberOfColumns
    }

    oneRowAndOneColumn () {
        return [{
            id: getId(),
            style: {},
            className: "", // the section with wraps this grid section need to have the appropriate grid configuration.
            coordinates: [1, 1],
            componentStates: [{
                id: getId(),
                type: 'rich text',
                state: "Write some rich text...",
            }],
            styleInput: "",
        }]
    }


    twoRowsAndOneColumn () {

    }

    twoRowsAndThreeColumnsOnTheBottom() {

    }

    _getBaseSection() {
        return [{
            id: getId(),
            coordinates: [1, 1],
            componentStates: [{
                id: getId(),
                type: 'rich text',
                state: "Write some rich text...",
            }],
            styleInput: "",
        }]
    }

}



class SectionFactory {



    oneRowAndOneColumn() {
        newSection = {
            id: getId(),
            style: {},
            className: template.className,
            styleInput: "",
            selectedLayout: template.selectedLayout, 
            gridSections: template.gridSections,
        }
        
    }
}


makeGridSections(layoutName) {
    if ((typeof(layoutName) === 'undefined') || (layoutName === null)) {
        layoutName = 'oneColumn'
    }



    let gridSections = [{
        id: getId(),
        style: {
            gridColumnStart: 1,
            gridColumnEnd: gridLayout.numColumns+1,
            width: innerWidth, // px
        },
        coordinates: [1, 1],
        componentStates: [{
            id: getId(),
            type: 'rich text',
            state: "<p>Write some rich text here...<img src=\"/images/background.jpg\" style=\"width: 51%;\"></p><p><br></p><p><br></p><iframe class=\"ql-video ql-align-center\" frameborder=\"0\" allowfullscreen=\"true\" src=\"https://www.youtube.com/embed/vIfGgDnmBXg?showinfo=0\" style=\"width: 60%; height: 362.25px;\"></iframe><p><br></p>",
        }],
        styleInput: "{'border': '3px solid black',} ",
    }]

    for(let i=1; i <= gridLayout.numColumns; i++) {
        gridSections.push({ // Do I want a column to be able to contain multiple components, quill and an image for instance?
            id: getId(),
            style: { // the style express fully which colum should get occupied 
                gridColumnStart: i,
                gridColumnEnd: i+1,
                width: columnWidth, // px
            },
            coordinates: [i, 2], // May extend to 3D layouts, this is somewhat redundant to style
            componentStates: [{ // is the source of truth and state for components in the grid section
                id: getId(),
                type: 'rich text',
                state: '<p>Write some rich text here...</p>',
            }], // React components and markup to be rendered, can be created from componentStates
            styleInput: "{'border': '3px solid black',} ",
        })
    }
    return gridSections
}



    // Want to have it dynamically adjust and have quill respect the boundaries of the grid
    updateSectionWidths(sectionUpdate, sectionIndex) {
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
     