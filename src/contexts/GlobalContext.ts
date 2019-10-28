import React from 'react'
import { IGlobalContext } from '../App'

export const GlobalContext = React.createContext<IGlobalContext>({
    cssDocument: [],
    pathPrefix: '',
    toggleEdit: (event) => {},
    editing: -1,
    setActiveRichTextEditor: () => {},
    activeRichTextEditor: '', 
    
    updateSectionInFocus: () => {}, 
    sectionInFocus: '',
    sectionInFocusIndex: -1,
    
    updateGridSectionInFocus: () => {},
    gridSectionInFocus: '',
    gridSectionInFocusIndex: -1,

    updateComponentInFocus: () => {},
    componentInFocus: '',
    componentInFocusIndex: -1, 

    enableSpacing: false,

    authenticated: false,
    flashMessage: (message, duration) => {},
});
