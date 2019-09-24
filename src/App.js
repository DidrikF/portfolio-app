import React from 'react'
import axios from 'axios'
import update from 'immutability-helper';
import { BrowserRouter as Router, Route, Link, NavLink, HashRouter, Redirect } from "react-router-dom"; 

import localforage from 'localforage'
import _ from 'lodash'
import * as arrayMove from  'array-move'

// import ContentEditable from 'react-contenteditable' // use for inputs that does not require rich text editing. This allows inputs to have the same style 
import AuthNav from './AuthNav'
import ViewNav from './ViewNav'
import AccountInfo from './AccountInfo';
import Page from './Page'
import { UserInfo } from './side-navigation'

import AccountPage from './AccountPage'
import ImageUploader from './ImageUploader'
import FileUploader from './FileUploader'

import CSSManager from './CSSManager'
import { cssDocumentToString, combineCssDocuments } from './helpers';

import { GlobalContext } from './contexts'

import { getId } from './helpers'
import { gridLayouts } from './grid'
import { updateHeightOfVideos } from './content-components/RichText';

/**
 * Refactoring:
 * use IDs to get a hold of html elements
 * Use css to set min height of a page, not javascript
 * 
 */

/**
 * Bugs:
 * 
 *  
 */

// The use of this function is messy and I would like this logic to be handled by css. (use flex-basis? )
// # REFACTOR: do in css
function setScrollableHeight() {
    const userInfoElement = document.getElementsByClassName("SN-UserInfo")[0]
    const accountInfoElement = document.getElementById("SN__account-info")
    const documentHeight = document.documentElement.clientHeight
    const scrollableHeight = documentHeight - userInfoElement.offsetHeight - accountInfoElement.offsetHeight
    
    this.setState({
        scrollableHeight: scrollableHeight
    })
    
}

function deepStyleMerge(obj, update) {
    _.assign(obj, update)
    if (update.style && Object.keys(update.style).length === 0) {
        obj.style = {} // #REFACTOR Clear style (not optimal)
    }
    return obj
}

class App extends React.Component {
    constructor(props) {
        super(props)
        
        window.addEventListener("resize", updateHeightOfVideos) // #REFACTOR: solve in CSS
        window.addEventListener("resize", setScrollableHeight.bind(this))
        
        window.addEventListener("keyup", (e) => {
            if (e.key === "Escape") {
                this.clearFocus();
            }
        })

        // #ADD: clear focus on click outside active element, but only in the "editable" area.
        this.updateApplicationStyles = this.updateApplicationStyles.bind(this)

        this.showSideNavigation = this.showSideNavigation.bind(this)
        this.closeSideNavigation = this.closeSideNavigation.bind(this)
        this.showCSSM = this.showCSSM.bind(this)
        this.closeCSSM = this.closeCSSM.bind(this)

        this.flashMessage = this.flashMessage.bind(this)

        this.createPage = this.createPage.bind(this)
        this.deletePage = this.deletePage.bind(this)
        this.updatePageState = this.updatePageState.bind(this)
        this.applyPageStyles = this.applyPageStyles.bind(this)
        
        this.clearFocus = this.clearFocus.bind(this)
        this.toggleEdit = this.toggleEdit.bind(this)
        this.toggleSpacing = this.toggleSpacing.bind(this)
        this.setActiveRichTextEditor = this.setActiveRichTextEditor.bind(this)
        this.updateComponentInFocus = this.updateComponentInFocus.bind(this)
        this.updateSectionInFocus = this.updateSectionInFocus.bind(this)
        this.updateGridSectionInFocus = this.updateGridSectionInFocus.bind(this) 
        // this.updateProjectInFocus = this.updateProjectInFocus.bind(this)

        // Update Section Related
        this.addSection = this.addSection.bind(this)
        this.addComponent = this.addComponent.bind(this)
        // this.makeGridSections = this.makeGridSections.bind(this) // may not need 
        this.updateSectionLayout = this.updateSectionLayout.bind(this)
        this.updateSectionWidths = this.updateSectionWidths.bind(this)

        // Update Component Related
        this.updateSectionState = this.updateSectionState.bind(this)
        this.applySectionStyles = this.applySectionStyles.bind(this)
        this.updateGridSectionState = this.updateGridSectionState.bind(this)
        this.applyGridSectionStyles = this.applyGridSectionStyles.bind(this)
        this.updateComponentState = this.updateComponentState.bind(this)
        this.applyComponentStyles = this.applyComponentStyles.bind(this)

        this.deleteObject = this.deleteObject.bind(this)
        this.moveObject = this.moveObject.bind(this)

        this.saveActivePage = this.saveActivePage.bind(this)

        this.setPageStateFromTemplate = this.setPageStateFromTemplate.bind(this)
        this.createTemplate = this.createTemplate.bind(this)
        this.deleteTemplate = this.deleteTemplate.bind(this)

        this.loadProtectedData = this.loadProtectedData.bind(this);

        this.setAuthenticated = this.setAuthenticated.bind(this)


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
            // Application State
            messages: [],

            user: {},

            pages: [],
            activePage: "",
            templates: [],

            // Context Objects
            globalContextObj: {
                cssDocument: [],
                pathPrefix: '',
                toggleEdit: this.toggleEdit,
                editing: false, // when active, this holds the page index of the active page (not sure if this is robust)
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

    updateApplicationStyles(cssDocument) {
        this.setState(state => {
            state.globalContextObj.cssDocument = cssDocument;
            return {
                globalContextObj: state.globalContextObj,
            }
        })
    }

    showSideNavigation() {
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
    closeSideNavigation() {
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

    showCSSM() {
        this.setState(state => {
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

    closeCSSM() {
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

    flashMessage(message, duration) {
        this.setState((state, props) => {
            state.messages.push(message)
            return {
                messages: state.messages
            }
        })

        setTimeout(() => {
            this.setState((state, props) => {
                const indexToRemove = state.messages.findIndex(msg => msg === message)
                state.messages.splice(indexToRemove, 1)
                return {
                    messages: state.messages
                }
            })
        }, duration * 1000)
    }



    // ________________Global context related_____________________
    toggleEdit(e) {
        let value = e.target.value ? e.target.value : false // e.target.value is a string
        this.setState((state, props) => {
            let globalContextObj = state.globalContextObj
            globalContextObj.editing = value
            return {
                globalContextObj
            }
        })
    }


    setActiveRichTextEditor(id) {
        this.setState((state, props) => {
            let globalContextObj = state.globalContextObj
            globalContextObj.activeRichTextEditor = id
            return {
                globalContextObj
            }
        })
    }

    // #REFACTOR: merge into one function (control only the most specific element selected and deduce its "parents", but not requring walking the DOM).
    updateSectionInFocus(sectionId, sectionIndex) {
        if (!this.state.globalContextObj.editing) return
        this.setState((state, props) => {
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
    updateGridSectionInFocus(gridSectionId, gridSectionIndex) {
        if (!this.state.globalContextObj.editing) return
        this.setState((state, props) => {
            let globalContextObj = state.globalContextObj
            globalContextObj.gridSectionInFocus = gridSectionId 
            globalContextObj.gridSectionInFocusIndex = gridSectionIndex

            return {
                globalContextObj
            }
        })
    }
    updateComponentInFocus(componentId, componentStateIndex) {
        if (!this.state.globalContextObj.editing) return
        this.setState((state, props) => {
            let globalContextObj = state.globalContextObj
            globalContextObj.componentInFocus = componentId
            globalContextObj.componentInFocusIndex = componentStateIndex
            return {
                globalContextObj
            }
        })
    }
    clearFocus() {
        this.setState((state, props) => {
            let globalContextObj = state.globalContextObj 
            globalContextObj.componentInFocus = ''
            globalContextObj.gridSectionInFocus = ''
            globalContextObj.sectionInFocus = ''
            globalContextObj.projectInFocus = ''
            globalContextObj.sectionInFocusIndex = -1
            globalContextObj.gridSectionInFocusIndex = -1
            globalContextObj.componentInFocusIndex = -1
            globalContextObj.projectInFocusIndex = -1
            return {
                globalContextObj
            }
        })
    }

    toggleSpacing() {
        this.setState((state, props) => {
            let globalContextObj = state.globalContextObj 
            globalContextObj.enableSpacing = !globalContextObj.enableSpacing
            return {
                globalContextObj
            }
        })
    }

    //___________________Navigation and Editor Panel Related________________________
    setAuthenticated(value) {
        this.setState((state, props) => {
            const globalContextObj = state.globalContextObj
            globalContextObj["authenticated"] = value

            if(value === true) {
                return {
                    globalContextObj: globalContextObj
                }
            } else {
                this.clearFocus()
                globalContextObj["editing"] = false
                globalContextObj["enableSpacing"] = false
                return {
                    globalContextObj: globalContextObj
                }
            }
        })
    }

    createPage(type, pageTitle) {
        console.log(axios.defaults)
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

        axios.post("/pages", page).then(response => {
            this.setState((state, props) => {
                state.pages.push(response.data)
                return {
                    pages: state.pages
                }
            }).catch(e => {
                this.flashMessage({text: "Failed to create page, it will not be possible to save updates.", type: "error"}, 3)
            })
        })
    }

    updatePageState(pageUpdate, pageIndex) {
        if (!this.state.globalContextObj.editing) return

        this.setState((state, props) => {
            let page = state.pages[pageIndex]
            state.pages[pageIndex]= deepStyleMerge(page, pageUpdate)
            return {
                pages: state.pages
            }
        })
    }

    applyPageStyles(pageIndex) {
        const page = this.state.pages[pageIndex]
        try {
            const styleString = page.styleInput
            if (styleString === "") {
                this.updatePageState({
                    style: {},
                }, pageIndex)
                return
            }
            const styleObject = JSON.parse(styleString)
            const pageUpdate = {
                style: styleObject
            }
            this.updatePageState(pageUpdate, pageIndex)
            
        } catch (error) {
            this.flashMessage({
                text: "Styles are not expressed in valid JSON. Error: \n" + error,
                type: "error",
            }, 3);
            console.log("Invalid styles, not able to parse as JSON. Error: ", error);
        }
    }

    deletePage(pageIndex) {
        const pageToDelete = this.state.pages[pageIndex]

        if(!window.confirm(`Are you sure you want to delete page: ${pageToDelete.title}?`)) return

        axios.delete(`/pages/${pageToDelete.pathTitle}`).then(response => {
            this.setState((state, props) => {
                state.pages.splice(pageIndex, 1)
                return {
                    pages: state.pages
                }
            })
        }).catch(error => {
            this.flashMessage({
                text: "Failed to delete page.",
                type: "error",
            }, 3)
        })
    }

    makeGridSections(gridSectionTemplate) {
        return gridSectionTemplate.map(gridSection => {
            const newGridSection = {};
            Object.assign(newGridSection, gridSection);
            newGridSection["id"] = getId()
            newGridSection["style"] = {}
            newGridSection["styleInput"] = ""
            newGridSection["componentStates"] = []
            return newGridSection
        })
    }

    makeSection(template) {
        const section = {};
        Object.assign(section, template);
        section["id"] = getId();
        section["style"] = {};
        section["styleInput"] = "";
        section["gridSections"] = this.makeGridSections(section["gridSections"]);
        return section;
    }

    makeSectionFromUserTemplate(userTemplate) {
        const section = userTemplate.template;
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

    addSection(template) {
        let section;
        if (template && template.template) {
            section = this.makeSectionFromUserTemplate(template);
        } else if (!template) {
            template = gridLayouts["Grid_1_1"]
            section = this.makeSection(template)
        }
        const sectionInFocusIndex = (this.state.globalContextObj.sectionInFocusIndex >= 0) ? this.state.globalContextObj.sectionInFocusIndex : 0
        this.setState((state, props) => {
            state.pages[state.globalContextObj.editing].sections.splice(sectionInFocusIndex+1, 0, section)
            return {
                pages: state.pages
            }
        })

    }
    
    updateSectionLayout(e) {
        if (this.state.globalContextObj.sectionInFocusIndex < 0) return
        const layoutName = e.target.value
        if (!window.confirm(`Are you sure you want to change layout to "${layoutName}"? \nThe current state of the section will be lost.`)) return
        
        const sectionTemplateName = Object.keys(this.state.gridLayouts).find(gridLayoutName => {
            const gridLayout = this.state.gridLayouts[gridLayoutName]
            return gridLayout.layoutName === layoutName
        })

        const sectionTemplate = this.state.gridLayouts[sectionTemplateName]
        const section = this.makeSection(sectionTemplate)

        this.setState((state, props) => {
            state.pages[state.globalContextObj.editing].sections.splice(this.state.globalContextObj.sectionInFocusIndex, 1, section)
            return {
                pages: state.pages
            }
        })
    }

    // #REFACTOR: this may have been fixed allready, if so remove, if not, solve with css
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
     

    updateSectionState(sectionUpdate, sectionIndex) {
        if (!this.state.globalContextObj.editing) return

        this.setState((state, props) => {

            let section = state.pages[state.globalContextObj.editing].sections[sectionIndex]
            
            state.pages[state.globalContextObj.editing].sections[sectionIndex] = deepStyleMerge(section, sectionUpdate)
            return {
                pages: state.pages
            }
        })
    }
    // #REFACTOR: can these methods style update methods be merged?
    applySectionStyles(sectionIndex) {
        const section = this.state.pages[this.state.globalContextObj.editing].sections[sectionIndex]
        try {
            const styleString = section.styleInput
            if (styleString === "") {
                this.updateSectionState({
                    style: {},
                }, sectionIndex)
                return
            }
            const styleObject = JSON.parse(styleString)
            const sectionUpdate = {
                style: styleObject
            }
            this.updateSectionState(sectionUpdate, sectionIndex)
        } catch (error) {
            console.log("Invalid styles, not able to parse as JSON. Error: ", error)
        }
    }

    updateGridSectionState(gridSectionUpdate, sectionIndex, gridSectionIndex) {
        if (!this.state.globalContextObj.editing) return

        this.setState((state, props) => {
            let gridSection = state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex]
            state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex] = deepStyleMerge(gridSection, gridSectionUpdate)
            return {
                pages: state.pages
            }
        })
    }

    // #REFACTOR: can these methods style update methods be merged?    
    applyGridSectionStyles(sectionIndex, gridSectionIndex) {
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
            const styleObject = JSON.parse(styleString)
            const gridSectionUpdate = {
                style: styleObject
            }
            this.updateGridSectionState(gridSectionUpdate, sectionIndex, gridSectionIndex)
            
        } catch (error) {
            console.log("Invalid styles, not able to parse as JSON. Error: ", error)
        }
     }
 
    // #REFACTOR: use a switch statement instead... Extract code to make different components.
    addComponent(componentType, template) {
        this.setState((state, props) => {
            let { sectionInFocusIndex, gridSectionInFocusIndex, componentInFocusIndex} = this.state.globalContextObj
            
            if ((sectionInFocusIndex === -1) || (gridSectionInFocusIndex === -1)) {
                return
            }
            if (componentInFocusIndex === -1) {
                componentInFocusIndex = 0
            }
            let newComponent;

            if (componentType === 'rich text') {
                newComponent = {
                    id: getId(),
                    style: {},
                    className: "",
                    styleInput: "",
                    type: 'rich text',
                    state: "<div>Rich text...</div>"
                }
            } else if (componentType === 'image') {
                // ...
            } else if (componentType === "template") {
                console.log("Template for component creation: ", template); 
                newComponent = {
                    id: getId(),
                    style: template.template.style || {},
                    className: template.template.className || "",
                    styleInput: "",
                    type: template.template.type,
                    state: template.template.state,
                }
            }
            state.pages[state.globalContextObj.editing].sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates.splice(componentInFocusIndex + 1, 0, newComponent)
            return {
                pages: state.pages
            }
        })
    }

    // #REFACTOR: it would be better if I could encapsulate the focus and resolution of the focused "object" somehow. Now I do complicated lookups all over the place with lots of state involved.
    updateComponentState(componentUpdate, sectionIndex, gridSectionIndex, componentStateIndex) {
        if (!this.state.globalContextObj.editing) return

        this.setState((state, props) => {
            let component = state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex].componentStates[componentStateIndex]
            state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex].componentStates[componentStateIndex] = deepStyleMerge(component, componentUpdate)
            return {
                pages: state.pages
            }
        })
    }

    // #REFACTOR: can these methods style update methods be merged?    
    applyComponentStyles(sectionIndex, gridSectionIndex, componentStateIndex) {
        const component = this.state.pages[this.state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex].componentStates[componentStateIndex]

        try {
            const styleString = component.styleInput
            if (styleString === "") {
                this.updateComponentState({
                    style: {},
                }, sectionIndex, gridSectionIndex, componentStateIndex)
                return
            }
            const styleObject = JSON.parse(styleString)
            const componentUpdate = {
                style: styleObject
            }
            this.updateComponentState(componentUpdate, sectionIndex, gridSectionIndex, componentStateIndex)
            
        } catch (error) {
            console.log("Invalid styles, not able to parse as JSON. Error: ", error)
        }
    }

    // #REFACTOR: decent, but so much state lookup stuff.
    deleteObject() {
        const { sectionInFocus, componentInFocus } = this.state.globalContextObj

        const { sectionInFocusIndex, gridSectionInFocusIndex, componentInFocusIndex } = this.state.globalContextObj
        this.setState((state, props) => {
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
        })
    }
    
    moveObject(places) {
        const { sectionInFocus, componentInFocus } = this.state.globalContextObj
        const { sectionInFocusIndex, gridSectionInFocusIndex, componentInFocusIndex } = this.state.globalContextObj

        this.setState((state, props) => {
            if (componentInFocus !== "") {
                let componentStates = state.pages[state.globalContextObj.editing].sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates
                let newIndex = (componentInFocusIndex+places)%componentStates.length
                state.pages[state.globalContextObj.editing].sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates = arrayMove(
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
                state.pages[state.globalContextObj.editing].sections = arrayMove(state.pages[state.globalContextObj.editing].sections, sectionInFocusIndex, newIndex)
                this.state.globalContextObj.updateSectionInFocus(sectionInFocus, newIndex)
                return {
                    pages: state.pages
                }
            }
        })
    }
    
    getActivePageIndexFromPath(path) { // This is unastable in some situations, dont know why.
        for (let i = 0; i < this.state.pages.length; i++) {
            if (this.state.pages[i].path === path) {
                return i
            }
        }
        return false
    }

    //__________________ Template Related _____________________
    setPageStateFromTemplate(template) {
        if (!this.state.globalContextObj.editing) return
        if (window.confirm(`Are you sure you want to apply "${template.title}" as a template? The current state of the page will be lost.`)) {
            this.setState((state, props) => {
                state.pages[state.globalContextObj.editing]["sections"] = template.template.sections || []
                state.pages[state.globalContextObj.editing]["style"] = template.template.style || {}
                state.pages[state.globalContextObj.editing]["className"] = template.template.className || ""
                return {
                    pages: state.pages,
                }
            })
        }
    }

    createTemplate(type, title) {
        // get the state of the selected entity by using the ...InFocusIndex and type
        if (!this.state.globalContextObj.editing) return
        
        let entity; 

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
        console.log("posting to /templates", template)

        axios.post("/templates", template).then(response => {
            this.setState((state, props) => {
                state.templates.push(response.data)
                return {
                    templates: state.templates,
                }
            })
        }).catch(error => {
            this.flashMessage({text: "Failed to create template. ", type: "error"}, 3)
        })
    }
    
    deleteTemplate(templateIndex) {
        const templateToDelete = this.state.templates[templateIndex]
        axios.delete(`/templates/${templateToDelete._id}`).then(response => {
            this.setState((state, props) => {
                state.templates.splice(templateIndex, 1)
                return {
                    templates: state.templates,
                }
            })
        }).catch(error => {
            this.flashMessage({text: "Failed to delete template", type: "error"}, 3)
        })
    }

    //__________________ Data loading code___________________________________
    
    loadPages() {
        axios.get('/pages').then(response => {
            this.setState({
                pages: response.data || [],
            })
        }).catch(error => {
            this.setState({ // remove later (This is for "offline" development)
                pages: [
                    {
                        id: 1,
                        type: "page",
                        path: '/test-page',
                        pathTitle: "test-page", 
                        title: "Test Page",
                        style: {},
                        className: "",
                        sections: [],
                        show: true,
                    },
                    {
                        id: 2,
                        type: "project",
                        path: "/projects/test-project",
                        pathTitle: "test-project",
                        title: 'Test Project',
                        style: {},
                        className: "",
                        sections: [],
                        show: true,
                    }
                ]
            })
            this.flashMessage({text: "Failed to get pages, please reload the app.", type: "error"}, 3)
        })
    }

    // #REFACTOR: want a better thought out solution for visitors and admins to get the propper user. (need to deside if its for one or multiple people)
    loadUser() {
        axios.get("/user").then(response => {
            this.setState({
                user: response.data
            })
        }).catch(error => {
            this.setState({ // #OBS Remove this test code.
                user: {
                    image: "/images/profile_picture_color.jpg",
                    firstName: "Didrik",
                    lastName: "Fleischer",
                    description: "MSc in Industrial Economics and Professional Developer",
                }
            })
            this.flashMessage({ text: "Failed to load user data", type: "error"}, 3)
        })
    }

    loadTemplates() {
        axios.get("/templates").then(response => {
            this.setState({
                templates: response.data 
            })
        }).catch(error => {
            this.flashMessage({ text: "Failed to load template data", type: "error"}, 3)
        })
    }

    loadCssDocuments() {
        axios.get("/cssdocuments").then(response => {
            const combinedCssDocument = combineCssDocuments(response.data);
            const css = cssDocumentToString(combinedCssDocument);
            console.log(css);
            this.state.styleSheetRef.current.innerHTML = css;
          }).catch(e => {
            this.context.flashMessage({text: "Failed to get css documents, please try to reload the page.", type: "error"}, 3);
          })
    }

    loadProtectedData() {
        this.loadTemplates()
        // Add more as needed
    }


    //_______________ Data saving/updating/deleting code _________________________
    saveActivePage() {
        const activePageIndex = this.state.globalContextObj.editing
        const page = this.state.pages[activePageIndex]

        axios.put(`/${page.type}s/${page.pathTitle}`, page).then(response => {
            this.flashMessage({text: "Successfully saved the page!", type: "success"}, 3)
        }).catch(error => {
            this.flashMessage({text: "Failed to save the page, please try again.", type: "error"}, 3)
        })
    }

    // #REFACTOR: more data loading here?
    componentDidMount() {
        this.loadCssDocuments();
        this.loadPages();
        this.loadUser();


        setScrollableHeight.bind(this)()

        localforage.getItem("token").then(token => {
            axios.get("/authcheck", {
                headers: {
                    "Authorization": token,
                }
            }).then(response => {
                this.setAuthenticated(true)
                // update token in localstorage
                localforage.setItem("token", response.data.token)

                // set axios defaults
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
        }).catch(err => {
            console.log("Not a token in local storage! ")
        })

    }

    // #REFACTOR: remove once the toolbar issue and is solved in css 
    componentDidUpdate(prevProps, prevState) {
        if (
            !_.isEqual(prevState.user, this.state.user) || 
            (prevState.pages.length !== this.state.pages.length) || 
            (prevState.globalContextObj.authenticated !== this.state.globalContextObj.authenticated)
        ) {
            setScrollableHeight.bind(this)()
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
                                
                                {UserInfo(this.state.user) /* Logged in user, or the Admin (aka: me) */} 
                                
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
                                        <Route key={page.id} exact path={page.path} render={(props) => <Page {
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
                                            updateSectionWidths={this.updateSectionWidths}
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
                                    <Route exact path="/image-uploader" render={(props) => <ImageUploader {...props} flashMessage={this.flashMessage} />} />
                                    <Route exact path="/file-uploader" render={(props) => <FileUploader {...props} flashMessage={this.flashMessage} />} />
                                    <Route exact path="/account" render={(props) => <AccountPage {...props} flashMessage={this.flashMessage} />} />
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

