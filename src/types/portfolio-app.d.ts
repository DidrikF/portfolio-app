
type Section = {
    id: string,
    style?: {[key: string]: string},
    className?: string,
    selectedLayout: "oneColumn" | "twoColumns" | "threeColumns", 
    gridSections: GridSection[],
}

type GridSection = {
    id: string,
    style?: {[key: string]: string},
    className?: string,
    coordinates: [number, number],
    componentStates: ComponentState[],
} 

type ComponentState = {
    id: string,
    type: "rich text" | "project card" | "image", // options of strings
    state: any,
}

type Project = {
    id: string,
    sections: Section[]
}

interface AppState {
    projects: Project[],

}

/*
gridLayouts: gridLayouts,
    defaultGridLayout: 'oneColumn',
    defaultSectionPadding: '15px',
    // Application State
    showColorPicker: false,
    colorPickerColor: '#FFFFFF',
    
    newPageTitle: '', 
    pages: [
        {
            id: 1,
            path: '/',
            title: "Home",
            sections: [],
        }
    ],

    newProjectTitle: '',
    projects: [
        {
            id: 2,
            title: 'Test Project',
            sections: [],
            show: true,
        }
    ],
    
    {
        id: getId(),
        state: '',
        show: true,
        title: 'Project Title 1',
    }

    // Add functionality for multiple pages?
    /*{
        id: getId(),
        style: {
            background: '#FFF',
            padding: '15px', 
        }
        selectedLayout: '', 
        // cards: [], // don't know where it is best to store the cards. 
        gridSections: [{ // gridSection, in related to the selected layout
                id: getId(),
                style: {
                    gridColumnStart: 1,
                    gridColumnEnd: gridLayout.numColumns+1,
                    width: innerWidth, // px
                },
                coordinates: [1, 0],
                componentStates: [{ // Components
                    id: getId(),
                    type: 'rich text',
                    state: "<div>Hello</div>"
                }],
        }], // array of  gridSections
    }
    // Context Objects
    globalContextObj: {
        pathPrefix: '',
        toggleEdit: this.toggleEdit,
        editable: true,
        setActiveRichTextEditor: this.setActiveRichTextEditor,
        activeRichTextEditor: '', 
        
        updateSectionInFocus: this.updateSectionInFocus, 
        sectionInFocus: '',
        sectionInFocusIndex: -1,
        
        updateGridSectionInFocus: this.updateGridSectionInFocus,
        gridSectionInFocus: '',
        gridSectionInFocusIndex: -1,

        updateComponentInFocus: this.updateComponentInFocus,
        componentInFocus: '',
        componentInFocusIndex: -1, 

        updateProjectInFocus: this.updateProjectInFocus, 
        projectInFocus: '',
        projectInFocusIndex: -1,
    }
}
*/

// let printPoint: (point: Point) => string; // function declaration
// let ShorthandEquivalent: new () => Point; // constructor declaration


/* function overloading.
let numberStringSwap: {
  (value: number, radix?: number): string;
  (value: string): number;
};
*/ 




