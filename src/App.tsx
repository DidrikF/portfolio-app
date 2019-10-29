import React, { Key } from 'react'
import axios from 'axios'
import update from 'immutability-helper';
import { Route, HashRouter, RouteProps } from "react-router-dom"; 

import localforage from 'localforage'
import _ from 'lodash'
import * as arrayMove from  'array-move'

// import ContentEditable from 'react-contenteditable' // use for inputs that does not require rich text editing. This allows inputs to have the same style 
import AuthNav from './components/navigation/AuthNav'
import ViewNav from './components/navigation/ViewNav'
import AccountInfo from './components/navigation/AccountInfo';
import Page from './components/core/Page'
import { UserInfo } from './components/navigation/UserInfo'

import AccountPage from './components/account/AccountPage'
import ImageUploader from './components/uploaders/ImageUploader'
import FileUploader from './components/uploaders/FileUploader'

import CSSManager, { CSSItem } from './components/css-manager/CSSManager'
import CSSDocument from './components/css-manager/CSSDocument';
import { cssDocumentToString, combineCssDocuments } from './components/css-manager/helpers';

import { GlobalContext } from './contexts/GlobalContext'

import { getId, deepStyleMerge } from './helpers'
import { gridLayouts } from './components/core/grid'
import { updateHeightOfVideos } from './components/rich-text/RichText';

type KeyValue<T> = import('../types/basic-types').KeyValue<T>;

// Is this a good way to avoid name crashes? namespaces? adding prefixes?
type PageObj = import('../types/platform_types').Page;
type SectionObj = import('../types/platform_types').Section;
type GridSectionObj = import('../types/platform_types').GridSection;
type ComponentState = import('../types/platform_types').ComponentState;
type TemplateObj = import('../types/platform_types').Template<any>;
type UserObj = Partial<import('../types/platform_types').User>;
import { Id } from '../types/basic-types';
import { PageType, SectionTemplate, ComponentTemplate, PageTemplate } from '../types/platform_types';
import { Grid } from './components/core/grid';
/**
 * Refactoring:
 * Use css to set min height of a page, not javascript
 */

/**
 * Bugs:
 * getActivePageIndexFromPath might be unstable, this is at least something I have commented in the code.
 *  
 */

// The use of this function is messy and I would like this logic to be handled by css. (use flex-basis? )
// # REFACTOR: do in css

export type Message = {
    text: string,
    type: "error" | "success"
}

export type AppState = {
    styleSheetRef: React.RefObject<HTMLStyleElement>,
    scrollableHeight: number,
    sideNavigationStyle: KeyValue<string>,  
    CSSMStyle: KeyValue<string>,
    mainContentStyle: KeyValue<string>,
    gridLayouts: import('./components/core/grid').GridLayouts,
    defaultGridLayout: keyof import('./components/core/grid').GridLayouts, // or just string, because type script does not know about the layouts from the GridLayouts type?
    defaultSectionPadding: string,
    messages: Message[],
    user: UserObj,
    pages: PageObj[],
    activePage: string,
    templates: TemplateObj[],
    globalContextObj: IGlobalContext,

}

export type IGlobalContext = {
    cssDocument: CSSItem[],
    pathPrefix: string,
    toggleEdit: (event: React.SyntheticEvent & {target: any}) => void,
    editing: number,
    setActiveRichTextEditor: Function,
    activeRichTextEditor: string,
    updateSectionInFocus: Function
    sectionInFocus: string,
    sectionInFocusIndex: number,
    updateGridSectionInFocus: Function,
    gridSectionInFocus: string,
    gridSectionInFocusIndex: number,
    updateComponentInFocus: Function,
    componentInFocus: string,
    componentInFocusIndex: number,
    enableSpacing: boolean,
    authenticated: boolean,
    flashMessage: (message: Message, duration: number) => void
}

class App extends React.Component<any, AppState> {
    
    constructor(props: null) {
        super(props);

        this.state = {
            styleSheetRef: React.createRef(),
            scrollableHeight: 0,
            sideNavigationStyle: {
                width: "0px"
            },
            CSSMStyle: {
                width: "0px",
            },
            mainContentStyle: {
                marginLeft: "0px",
                marginRight: "0px",
            },
            gridLayouts: gridLayouts,
            defaultGridLayout: 'oneColumn',
            defaultSectionPadding: '0px',
            messages: [],
            user: {},
            pages: [],
            activePage: "",
            templates: [],
    
            globalContextObj: {
                cssDocument: [],
                pathPrefix: '',
                toggleEdit: this.toggleEdit,
                editing: -1,
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
    
                enableSpacing: false,
    
                authenticated: false,
                flashMessage: this.flashMessage,
            }
        }
    }

    updateApplicationStyles = (cssDocument: CSSItem[]) => {
        this.setState<any>((state: AppState): Partial<AppState> => {
            state.globalContextObj.cssDocument = cssDocument;
            return {
                globalContextObj: state.globalContextObj,
            }
        })
    }

    showSideNavigation = () => {
        this.setState(state => {            
            return {
                sideNavigationStyle: {
                    width: "300px"
                },
                mainContentStyle: {
                    marginLeft: "300px",
                    marginRight: state.mainContentStyle["marginRight"],
                }
            }
        })
    }
    closeSideNavigation = () => {
        this.setState(state => {
            return {
                sideNavigationStyle: {
                    width: "0px"
                },
                mainContentStyle: {
                    marginLeft: "0px",
                    marginRight: state.mainContentStyle["marginRight"],
                }
            }
        })
    }

    showCSSM = () => {
        this.setState<any>((state: AppState): Partial<AppState> => {
            return {
                CSSMStyle: {
                    width: "300px"
                },
                mainContentStyle: {
                    marginLeft: state.mainContentStyle.marginLeft,
                    marginRight: "300px",
                },
            }
        })
    }

    closeCSSM = () => {
        this.setState(state => {
            return {
                CSSMStyle: {
                    width: "0px"
                },
                mainContentStyle: {
                    marginLeft: state.mainContentStyle.marginLeft,
                    marginRight: "0px",
                },
            }
        })
    }

    flashMessage = (message: Message, duration: number) => {
        this.setState((state) => {
            state.messages.push(message)
            return {
                messages: state.messages
            }
        })

        setTimeout(() => {
            this.setState((state) => {
                const indexToRemove = state.messages.findIndex(msg => msg === message)
                state.messages.splice(indexToRemove, 1)
                return {
                    messages: state.messages
                }
            })
        }, duration * 1000)
    }



    // ________________Global context related_____________________
    toggleEdit = (e: React.SyntheticEvent & {target: any}) => {
        let value: number = e.target.value ? parseInt(e.target.value, 10) : -1 // e.target.value is a string
        this.setState<any>((state: AppState): Partial<AppState> => {
            let globalContextObj = state.globalContextObj
            globalContextObj.editing = value
            return {
                globalContextObj
            }
        })
    }


    setActiveRichTextEditor = (id: Id) => {
        this.setState((state) => {
            let globalContextObj = state.globalContextObj
            globalContextObj.activeRichTextEditor = id
            return {
                globalContextObj
            }
        })
    }

    // #REFACTOR: merge into one function (control only the most specific element selected and deduce its "parents", but not requring walking the DOM).
    updateSectionInFocus = (sectionId: Id, sectionIndex: number) => {
        if (this.state.globalContextObj.editing <= -1) return
        this.setState((state) => {
            let globalContextObj = state.globalContextObj
            if (sectionIndex !== globalContextObj.sectionInFocusIndex) {
                // reset ...
            }
            globalContextObj.sectionInFocus = sectionId 
            globalContextObj.sectionInFocusIndex = sectionIndex


            return {
                globalContextObj
            }
        })
    }
    updateGridSectionInFocus = (gridSectionId: Id, gridSectionIndex: number) => {
        if (this.state.globalContextObj.editing <= -1) return
        this.setState((state) => {
            let globalContextObj = state.globalContextObj
            globalContextObj.gridSectionInFocus = gridSectionId 
            globalContextObj.gridSectionInFocusIndex = gridSectionIndex

            return {
                globalContextObj
            }
        })
    }
    updateComponentInFocus = (componentId: Id, componentStateIndex: number) => {
        if (this.state.globalContextObj.editing <= -1) return
        this.setState((state) => {
            let globalContextObj = state.globalContextObj
            globalContextObj.componentInFocus = componentId
            globalContextObj.componentInFocusIndex = componentStateIndex
            return {
                globalContextObj
            }
        })
    }
    clearFocus = (event?: KeyboardEvent) => {
        if (event && event.key !== "Escape") return;

        this.setState((state) => {
            let globalContextObj = state.globalContextObj 
            globalContextObj.componentInFocus = ''
            globalContextObj.gridSectionInFocus = ''
            globalContextObj.sectionInFocus = ''
            globalContextObj.sectionInFocusIndex = -1
            globalContextObj.gridSectionInFocusIndex = -1
            globalContextObj.componentInFocusIndex = -1
            return {
                globalContextObj
            }
        })
    }

    toggleSpacing = () => {
        this.setState((state) => {
            let globalContextObj = state.globalContextObj 
            globalContextObj.enableSpacing = !globalContextObj.enableSpacing
            return {
                globalContextObj
            }
        })
    }

    //___________________Navigation and Editor Panel Related________________________
    setAuthenticated = (value: boolean) => {
        this.setState((state) => {
            const globalContextObj = state.globalContextObj
            globalContextObj["authenticated"] = value

            if(value === true) {
                return {
                    globalContextObj: globalContextObj
                }
            } else {
                this.clearFocus()
                globalContextObj["editing"] = -1;
                globalContextObj["enableSpacing"] = false;
                return {
                    globalContextObj: globalContextObj
                }
            }
        })
    }

    createPage = (type: PageType, pageTitle: string) => {
        let path;
        let pathTitle = pageTitle.toLowerCase().replace(" ", "-")
        
        if (type === "page") {
            if (pageTitle.toLowerCase() === "home") {
                path  = "/" // Special naming for the home page
            } else {
                path =  `/${pathTitle}` // replace , and . etc
            }
        } else {
            path =  `/${type}/${pathTitle}` // replace , and . etc
        }

        let page = { // if the server created this object, it would not have to validate it...
            id: getId(),
            type: type,
            path: path,
            pathTitle: pathTitle, 
            title: pageTitle, 
            style: {},
            className: "",
            sections: [],
            show: true,
        }

        axios.post("/pages", page).then((response) => {
            this.setState((state) => {
                state.pages.push(response.data)
                return {
                    pages: state.pages
                }
            })
        }).catch(() => {
            this.flashMessage({text: "Failed to create page, it will not be possible to save updates.", type: "error"}, 3)
        })
    }

    updatePageState = (pageUpdate: Partial<PageObj>, pageIndex: number) => {
        if (this.state.globalContextObj.editing  <= -1) return

        this.setState((state) => {
            let page = state.pages[pageIndex] as any
            state.pages[pageIndex]= deepStyleMerge(page, pageUpdate)
            return {
                pages: state.pages
            }
        })
    }

    applyPageStyles = (pageIndex: number) => {
        const page = this.state.pages[pageIndex]
        try {
            const styleString = page.styleInput || "";
            if (styleString === "") {
                this.updatePageState({
                    style: {},
                }, pageIndex)
                return
            }
            const styleObject: KeyValue<string> = JSON.parse(styleString)
            const pageUpdate: Partial<PageObj> = {
                style: styleObject
            }
            this.updatePageState(pageUpdate, pageIndex)
            
        } catch (error) {
            this.flashMessage({
                text: "Styles are not expressed in valid JSON. Error: \n" + error,
                type: "error",
            }, 3);
        }
    }

    deletePage = (pageIndex: number) => {
        const pageToDelete = this.state.pages[pageIndex]

        if(!window.confirm(`Are you sure you want to delete page: ${pageToDelete.title}?`)) return

        axios.delete(`/pages/${pageToDelete.pathTitle}`).then(() => {
            this.setState((state) => {
                state.pages.splice(pageIndex, 1)
                return {
                    pages: state.pages
                }
            })
        }).catch(() => {
            this.flashMessage({
                text: "Failed to delete page.",
                type: "error",
            }, 3)
        })
    }

    makeGridSections = (gridSectionTemplate: GridSectionObj[]): GridSectionObj[] => {
        return gridSectionTemplate.map((gridSection: GridSectionObj): any => {
            const newGridSection: Partial<GridSectionObj> = {};
            Object.assign(newGridSection, gridSection);
            newGridSection["id"] = getId()
            newGridSection["style"] = {}
            newGridSection["styleInput"] = ""
            newGridSection["componentStates"] = []
            return newGridSection
        })
    }

    makeSection = (sectionTemplate: SectionObj | Grid): SectionObj => {
        const section: Partial<SectionObj> = {};
        Object.assign(section, sectionTemplate);
        section["id"] = getId();
        section["style"] = {};
        section["styleInput"] = "";
        section["gridSections"] = this.makeGridSections(section["gridSections"] as GridSectionObj[]);
        return section as SectionObj;
    }

    makeSectionFromUserTemplate = (sectionTemplate: SectionTemplate) => {
        const section = sectionTemplate.template;
        section["id"] = getId();
        section["styleInput"] = "";
        section["gridSections"] = section["gridSections"].map(gridSection => {
            gridSection["id"] = getId();
            gridSection["styleInput"] = "";
            gridSection["componentStates"] = gridSection["componentStates"].map(componentState => {
                componentState["id"] = getId();
                componentState["styleInput"] = "";
                return componentState;
            })
            return gridSection;
        })
        return section;
    }

    addSection = (template: SectionTemplate) => {
        let section: SectionObj;
        if (template && template.template) {
            section = this.makeSectionFromUserTemplate(template);
        } else if (!template) {
            section = this.makeSection(gridLayouts["Grid_1_1"])
        }
        const sectionInFocusIndex = (this.state.globalContextObj.sectionInFocusIndex >= 0) ? this.state.globalContextObj.sectionInFocusIndex : 0
        this.setState((state) => {
            state.pages[state.globalContextObj.editing].sections.splice(sectionInFocusIndex+1, 0, section)
            return {
                pages: state.pages
            }
        })

    }
    
    updateSectionLayout = (e: React.SyntheticEvent & {target: any}) => {
        if (this.state.globalContextObj.sectionInFocusIndex < 0) return
        const layoutName = e.target.value
        if (!window.confirm(`Are you sure you want to change layout to "${layoutName}"? \nThe current state of the section will be lost.`)) return
        
        const sectionTemplateName = Object.keys(this.state.gridLayouts).find(gridLayoutName => {
            const gridLayout = this.state.gridLayouts[gridLayoutName]
            return gridLayout.layoutName === layoutName
        })

        if (!sectionTemplateName) return;

        const sectionTemplate = this.state.gridLayouts[sectionTemplateName]
        const section = this.makeSection(sectionTemplate)

        this.setState((state) => {
            state.pages[state.globalContextObj.editing].sections.splice(this.state.globalContextObj.sectionInFocusIndex, 1, section)
            return {
                pages: state.pages
            }
        })
    }

    updateSectionState = (sectionUpdate: Partial<SectionObj>, sectionIndex: number) => {
        if (!this.state.globalContextObj.editing) return

        this.setState((state) => {
            let section = state.pages[state.globalContextObj.editing].sections[sectionIndex]
            state.pages[state.globalContextObj.editing].sections[sectionIndex] = deepStyleMerge(section, sectionUpdate)
            return {
                pages: state.pages
            }
        })
    }
    // #REFACTOR: can these methods style update methods be merged? I want to pull this into redux anyway...
    applySectionStyles = (sectionIndex: number) => {
        const section = this.state.pages[this.state.globalContextObj.editing].sections[sectionIndex]
        try {
            const styleString = section.styleInput
            if (styleString === "") {
                this.updateSectionState({
                    style: {},
                }, sectionIndex)
                return
            }
            if (styleString) {
                const styleObject = JSON.parse(styleString)
                const sectionUpdate = {
                    style: styleObject
                }
                this.updateSectionState(sectionUpdate, sectionIndex)
            }
        } catch (error) {
            console.log("Invalid styles, not able to parse as JSON. Error: ", error)
        }
    }

    updateGridSectionState = (gridSectionUpdate: Partial<GridSectionObj>, sectionIndex: number, gridSectionIndex: number) => {
        if (!this.state.globalContextObj.editing) return

        this.setState((state) => {
            let gridSection = state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex]
            state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex] = deepStyleMerge(gridSection, gridSectionUpdate)
            return {
                pages: state.pages
            }
        })
    }

    // #REFACTOR: can these methods style update methods be merged?    
    applyGridSectionStyles = (sectionIndex: number, gridSectionIndex: number) => {
        const gridSection = this.state.pages[this.state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex]
        console.log("applyGridSectionStyles: ", gridSection, sectionIndex, gridSectionIndex)
        try {
            const styleString = gridSection.styleInput
            if (styleString === "") {
                this.updateGridSectionState({
                    style: {},
                }, sectionIndex, gridSectionIndex)
                return
            }
            if (styleString) {
                const styleObject = JSON.parse(styleString)
                const gridSectionUpdate = {
                    style: styleObject
                }
                this.updateGridSectionState(gridSectionUpdate, sectionIndex, gridSectionIndex)
            }
            
        } catch (error) {
            console.log("Invalid styles, not able to parse as JSON. Error: ", error)
        }
     }
 
    // #REFACTOR: use a switch statement instead... Extract code to make different components.
    addComponent = (componentType: string, template: ComponentTemplate) => {
        this.setState<any>((state: AppState): Partial<AppState> | undefined => {
            let { sectionInFocusIndex, gridSectionInFocusIndex, componentInFocusIndex} = this.state.globalContextObj
            
            if ((sectionInFocusIndex === -1) || (gridSectionInFocusIndex === -1)) {
                return
            }
            if (componentInFocusIndex === -1) {
                componentInFocusIndex = 0
            }
            let newComponent: ComponentState | undefined = undefined;

            if (componentType === 'rich text') {
                newComponent = {
                    id: getId(),
                    type: 'rich text',
                    style: {},
                    className: "",
                    styleInput: "",
                    state: "<div>Rich text...</div>"
                }
            } else if (componentType === 'image') {
                // ...
            } else if (componentType === "template") {
                console.log("Template for component creation: ", template); 
                newComponent = {
                    id: getId(),
                    type: template.template.type,
                    style: template.template.style || {},
                    className: template.template.className || "",
                    styleInput: "",
                    state: template.template.state,
                }
            }

            if (newComponent) {
                state.pages[state.globalContextObj.editing].sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates.splice(componentInFocusIndex + 1, 0, newComponent)
                return {
                    pages: state.pages
                }
            }
            return undefined;
        })
    }

    // #REFACTOR: it would be better if I could encapsulate the focus and resolution of the focused "object" somehow. Now I do complicated lookups all over the place with lots of state involved.
    updateComponentState = (componentUpdate: Partial<ComponentState>, sectionIndex: number, gridSectionIndex: number, componentStateIndex: number) => {
        if (!this.state.globalContextObj.editing) return

        this.setState((state) => {
            let component = state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex].componentStates[componentStateIndex]
            state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex].componentStates[componentStateIndex] = deepStyleMerge(component, componentUpdate)
            return {
                pages: state.pages
            }
        })
    }

    // #REFACTOR: can these methods style update methods be merged?    
    applyComponentStyles = (sectionIndex: number, gridSectionIndex: number, componentStateIndex: number) => {
        const component = this.state.pages[this.state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex].componentStates[componentStateIndex]

        try {
            const styleString = component.styleInput
            if (styleString === "") {
                this.updateComponentState({
                    style: {},
                }, sectionIndex, gridSectionIndex, componentStateIndex)
                return
            }
            if (styleString) {
                const styleObject = JSON.parse(styleString)
                const componentUpdate = {
                    style: styleObject
                }
                this.updateComponentState(componentUpdate, sectionIndex, gridSectionIndex, componentStateIndex)
            }
        } catch (error) {
            console.log("Invalid styles, not able to parse as JSON. Error: ", error)
        }
    }

    // #REFACTOR: decent, but so much state lookup stuff.
    deleteObject = () => {
        const { sectionInFocus, componentInFocus } = this.state.globalContextObj

        const { sectionInFocusIndex, gridSectionInFocusIndex, componentInFocusIndex } = this.state.globalContextObj
        this.setState<any>((state: AppState): Partial<AppState> | undefined => {
            if (componentInFocus !== "") { // delete component
                const componentState = state.pages[state.globalContextObj.editing].sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates[componentInFocusIndex]
                if (window.confirm('Are you sure you want to delete component (' + componentState.id + ') of type: ' + componentState.type + '?')) {
                    state.pages[state.globalContextObj.editing]
                        .sections[sectionInFocusIndex]
                        .gridSections[gridSectionInFocusIndex]
                        .componentStates
                        .splice(componentInFocusIndex, 1)
                    return {
                        pages: state.pages
                    }              
                }
            } else if (sectionInFocus !== "") {
                const section = state.pages[state.globalContextObj.editing].sections[sectionInFocusIndex]
                if (window.confirm('Are you sure you want to delete section (' + section.id + ') with index: ' + sectionInFocusIndex + '?')) {
                    state.pages[state.globalContextObj.editing]
                        .sections.splice(sectionInFocusIndex, 1)
                    return {
                        pages: state.pages
                    }
                }
            }
            return;
        })
    }
    
    moveObject = (places: number) => {
        const { sectionInFocus, componentInFocus } = this.state.globalContextObj
        const { sectionInFocusIndex, gridSectionInFocusIndex, componentInFocusIndex } = this.state.globalContextObj

        this.setState<any>((state: AppState): Partial<AppState> | undefined => {
            if (componentInFocus !== "") {
                let componentStates = state.pages[state.globalContextObj.editing].sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates
                let newIndex = (componentInFocusIndex+places)%componentStates.length
                state.pages[state.globalContextObj.editing].sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates = arrayMove.default(
                    componentStates, 
                    componentInFocusIndex, 
                    newIndex
                )
                // update componentInFocusIndex
                this.state.globalContextObj.updateComponentInFocus(componentInFocus, newIndex)

                return {
                    pages: state.pages
                }              
            } else if (sectionInFocus !== "") {
                let newIndex = (sectionInFocusIndex+places)%state.pages[state.globalContextObj.editing].sections.length
                state.pages[state.globalContextObj.editing].sections = arrayMove.default(state.pages[state.globalContextObj.editing].sections, sectionInFocusIndex, newIndex)
                this.state.globalContextObj.updateSectionInFocus(sectionInFocus, newIndex)
                return {
                    pages: state.pages
                }
            }
            return;
        })
    }
    
    getActivePageIndexFromPath = (path: string): number | boolean => { // This is unastable in some situations, dont know why.
        for (let i = 0; i < this.state.pages.length; i++) {
            if (this.state.pages[i].path === path) {
                return i
            }
        }
        return false
    }

    //__________________ Template Related _____________________
    setPageStateFromTemplate = (template: PageTemplate) => {
        if (this.state.globalContextObj.editing <= -1) return
        if (window.confirm(`Are you sure you want to apply "${template.title}" as a template? The current state of the page will be lost.`)) {
            this.setState((state) => {
                state.pages[state.globalContextObj.editing]["sections"] = template.template.sections || []
                state.pages[state.globalContextObj.editing]["style"] = template.template.style || {}
                state.pages[state.globalContextObj.editing]["className"] = template.template.className || ""
                return {
                    pages: state.pages,
                }
            })
        }
    }

    createTemplate = (type: string, title: string) => {
        // get the state of the selected entity by using the ...InFocusIndex and type
        if (!this.state.globalContextObj.editing) return
        
        let entity: any; 

        if (type === "page") {
            entity = this.state.pages[this.state.globalContextObj.editing]
        } else if (type === "section") {
            const sectionIndex = this.state.globalContextObj.sectionInFocusIndex
            if (sectionIndex === -1) {
                this.flashMessage({text: "Cannot create section template, no section is selected", type: "error"}, 3);
                return;
            }
            entity = this.state.pages[this.state.globalContextObj.editing].sections[sectionIndex]
        } else if (type === "component") {
            const sectionIndex = this.state.globalContextObj.sectionInFocusIndex;
            const componentIndex = this.state.globalContextObj.componentInFocusIndex ;
            const gridSectionIndex = this.state.globalContextObj.gridSectionInFocusIndex;
            if ((componentIndex === -1) || (sectionIndex === -1) || (gridSectionIndex === -1)) {
                this.flashMessage({text: "Cannot create component template, no component is selected", type: "error"}, 3);
                return;
            }         
            entity = this.state.pages[this.state.globalContextObj.editing]
                .sections[sectionIndex]
                .gridSections[gridSectionIndex]
                .componentStates[componentIndex];
        }

        delete entity["_id"]
        delete entity["id"]
        delete entity["styleInput"]
        delete entity["path"]
        delete entity["pathTitle"]
        delete entity["title"]
        
        const template = {
            type: type,
            title: title,
            template: entity,
        }

        axios.post("/templates", template).then(response => {
            this.setState((state, props) => {
                state.templates.push(response.data)
                return {
                    templates: state.templates,
                }
            })
        }).catch(() => {
            this.flashMessage({text: "Failed to create template. ", type: "error"}, 3)
        })
    }
    
    deleteTemplate = (templateIndex: number) => {
        const templateToDelete = this.state.templates[templateIndex]
        axios.delete(`/templates/${templateToDelete._id}`).then(response => {
            this.setState((state, props) => {
                state.templates.splice(templateIndex, 1)
                return {
                    templates: state.templates,
                }
            })
        }).catch(() => {
            this.flashMessage({text: "Failed to delete template", type: "error"}, 3)
        })
    }

    //__________________ Data loading code___________________________________
    
    loadPages = () => {
        axios.get('/pages').then(response => {
            this.setState({
                pages: response.data || [],
            })
        }).catch(() => {
            this.flashMessage({text: "Failed to get pages, please reload the app.", type: "error"}, 3)
        })
    }

    // #REFACTOR: want a better thought out solution for visitors and admins to get the propper user. (need to deside if its for one or multiple people)
    loadUser = () => {
        axios.get("/user").then(response => {
            this.setState({
                user: response.data
            })
        }).catch(() => {
            this.flashMessage({ text: "Failed to load user data", type: "error"}, 3)
        })
    }

    loadTemplates = () => {
        axios.get("/templates").then(response => {
            this.setState({
                templates: response.data 
            })
        }).catch(() => {
            this.flashMessage({ text: "Failed to load template data", type: "error"}, 3)
        })
    }

    loadCssDocuments = () => {
        axios.get("/cssdocuments").then(response => {
            const combinedCssDocument = combineCssDocuments(response.data);
            const css = cssDocumentToString(combinedCssDocument);
            (this.state.styleSheetRef as any).current.innerHTML = css;
        }).catch(() => {
            this.context.flashMessage({text: "Failed to get css documents, please try to reload the page.", type: "error"}, 3);
        })
    }

    loadProtectedData = () => {
        this.loadTemplates()
    }

    //_______________ Data saving/updating/deleting code _________________________
    saveActivePage = () => {
        const activePageIndex = this.state.globalContextObj.editing
        const page = this.state.pages[activePageIndex]

        axios.put(`/${page.type}s/${page.pathTitle}`, page).then(response => {
            this.flashMessage({text: "Successfully saved the page!", type: "success"}, 3)
        }).catch(error => {
            this.flashMessage({text: "Failed to save the page, please try again.", type: "error"}, 3)
        })
    }

    // OBS: does not look right
    setScrollableHeight = () => {
        const userInfoElement = document.getElementById("SN__user-info");
        const accountInfoElement = document.getElementById("SN__account-info")
        const documentHeight = document.documentElement.clientHeight
        if (userInfoElement && accountInfoElement) {
            const scrollableHeight = documentHeight - userInfoElement.offsetHeight - accountInfoElement.offsetHeight
    
            this.setState({
                scrollableHeight: scrollableHeight
            })
        }
    }
    
    // #REFACTOR: more data loading here?
    componentDidMount = () => {
        this.loadCssDocuments();
        this.loadPages();
        this.loadUser();
        
        this.setScrollableHeight();
        window.addEventListener("resize", updateHeightOfVideos) // #REFACTOR: solve in CSS
        window.addEventListener("resize", this.setScrollableHeight)
        window.addEventListener("keyup", this.clearFocus)

        localforage.getItem("token").then(token => {
            axios.get("/authcheck", {
                headers: {
                    "Authorization": token,
                }
            }).then(response => {
                this.setAuthenticated(true)

                localforage.setItem("token", response.data.token)
                
                axios.defaults.headers.common["Authorization"] = response.data.token

                // load protected data
                this.loadProtectedData()
                
            }).catch(error => {
                localforage.removeItem("token").catch(error => {
                    console.log("failed to remove token after finding out it was not valid. Error: ", error)
                })
                console.log("Token not valid! Error: ", error)
                this.setAuthenticated(false);
            })
        }).catch(() => {
            console.log("Not a token in local storage! ")
        })

    }

    componentWillUnmount = () => {
        window.removeEventListener("resize", updateHeightOfVideos);
        window.removeEventListener("resize", this.setScrollableHeight);
        window.removeEventListener("keyup", this.clearFocus);
    }

    // #REFACTOR: remove once the toolbar issue and is solved in css 
    componentDidUpdate = (_: any, prevState: AppState) => {
        if (
            !_.isEqual(prevState.user, this.state.user) || 
            (prevState.pages.length !== this.state.pages.length) || 
            (prevState.globalContextObj.authenticated !== this.state.globalContextObj.authenticated)
        ) {
            this.setScrollableHeight()
        }
    }

    // #REFACTOR: verify that only the needed props are passed down through the component tree
    render() {
        return (
            <GlobalContext.Provider value={this.state.globalContextObj}>
                <HashRouter>
                    <div className='App'>
                        <style ref={this.state.styleSheetRef}></style>
                        {/* Side Navigation Area */}
                        <button className="SN__show-button" onClick={this.showSideNavigation}><i className="material-icons">menu</i></button>
                        { this.state.globalContextObj.editing &&
                            <button className="CSSM__show-button" onClick={this.showCSSM}><i className="material-icons">menu</i></button>
                        }
                        <div 
                            id="SN__container" 
                            className="SN App__grid--side"
                            style={this.state.sideNavigationStyle}
                        >
                            <div style={{width: "300px"}}> 
                                <button className="SN__close-button" onClick={this.closeSideNavigation}><i className="material-icons">close</i></button>
                                
                                <UserInfo user={this.state.user} id="SN-UserInfo" /> 
                                
                                { this.state.globalContextObj.authenticated &&
                                    <AuthNav 
                                        scrollableHeight={this.state.scrollableHeight}
                                        pages={this.state.pages}
                                        toggleEdit={this.toggleEdit}
                                        saveActivePage={this.saveActivePage}
                                        deletePage={this.deletePage}

                                        createPage={this.createPage}
                                        clearFocus={this.clearFocus}
                                        toggleSpacing={this.toggleSpacing}
                                        addSection={this.addSection}
                                        addComponent={this.addComponent}
                                        moveObject={this.moveObject}
                                        deleteObject={this.deleteObject}
                                    />
                                } 
                                { !this.state.globalContextObj.authenticated && 
                                    <ViewNav 
                                        scrollableHeight={this.state.scrollableHeight}
                                        pages={this.state.pages}
                                    />
                                }
                                <AccountInfo 
                                    setAuthenticated={this.setAuthenticated}
                                    loadProtectedData={this.loadProtectedData}
                                    id="SN__account-info"
                                />
                            </div>

                        </div>

                        {/* This is the main content area 
                            only move the main content area to the right when in editing mode!
                        */}
                        <div className='App__grid--main' style={this.state.mainContentStyle}> {/* this.state.globalContextObj.editing ? this.state.mainContentStyle : {} */}
                            
                            {/* Editor Panel Area */}
                                <div className='App__toolbar-container' style={{
                                    display: (this.state.globalContextObj.editing) ? "block" : "none"
                                }}>
                                    {/* Quill toolbar here - it is tied together by the portal referencing this 
                                    element (using get element by id) and different components getting the 
                                    Portal and using it directly in their render methods. It's quite disorderly.*/}
                                    <div id='Toolbar__portal'></div>
                                </div>
                                { this.state.globalContextObj.editing &&
                                    <div className="Toolbar__spacer"></div>
                                }
                            {
                                this.state.pages.map((page, pageIndex) => {
                                    return (
                                        <Route key={page.id} exact path={page.path} render={(props: RouteProps) => <Page {
                                            ...props}
                                            id={page.id}
                                            pageIndex={pageIndex}
                                            page={page}
                                            
                                            // #REFACTOR: Toolbars are contained within pages/sections... (maybe I cannot remove any of these)
                                            templates={this.state.templates}
                                            createTemplate={this.createTemplate}
                                            deleteTemplate={this.deleteTemplate}
                                            setPageStateFromTemplate={this.setPageStateFromTemplate}

                                            addComponent={this.addComponent}
                                            addSection={this.addSection}

                                            enableSpacing={this.state.globalContextObj.enableSpacing}
                                            
                                            updatePageState={this.updatePageState}
                                            applyPageStyles={this.applyPageStyles}
                                            updateSectionLayout={this.updateSectionLayout}
                                            updateSectionState={this.updateSectionState}
                                            applySectionStyles={this.applySectionStyles}
                                            updateGridSectionState={this.updateGridSectionState}
                                            applyGridSectionStyles={this.applyGridSectionStyles}
                                            updateComponentState={this.updateComponentState}
                                            applyComponentStyles={this.applyComponentStyles}

                                            moveObject={this.moveObject} // #OBS remove i think
                                            deleteObject={this.deleteObject} // #OBS remove i think
                                        />} />
                                    )
                                })
                            }
                            { this.state.globalContextObj.authenticated &&
                                <React.Fragment>
                                    <Route exact path="/image-uploader" render={(props: RouteProps) => <ImageUploader {...props} flashMessage={this.flashMessage} />} />
                                    <Route exact path="/file-uploader" render={(props: RouteProps) => <FileUploader {...props} flashMessage={this.flashMessage} />} />
                                    <Route exact path="/account" render={(props: RouteProps) => <AccountPage {...props} flashMessage={this.flashMessage} />} />
                                </React.Fragment>
                            }


                            <div className="App__messages-container">
                                { 
                                    this.state.messages.map(message => {
                                        return (
                                            <p 
                                                className="App__flash-message"
                                                style={{
                                                    background: (message.type === "error") ? "orange" : "green",
                                                }}
                                            >
                                                { message.text }
                                            </p>

                                        )
                                    })
                                }
                            </div>     
                        </div>
                        { this.state.globalContextObj.editing &&
                            <CSSManager 
                                styleSheetRef={this.state.styleSheetRef} 
                                updateApplicationStyles={this.updateApplicationStyles}
                                closeCSSM={this.closeCSSM}
                                style={this.state.CSSMStyle}
                            />
                        }

                    </div>
                </HashRouter>
            </GlobalContext.Provider >
        )
    }
}

App.contextType = GlobalContext

export default App

