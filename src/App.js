import React from 'react'
import axios from 'axios'
import update from 'immutability-helper';
import { Login, Register } from './helper-components/auth'
import AuthNav from './AuthNav'
import ViewNav from './ViewNav'
import AccountInfo from './AccountInfo'
import localforage from 'localforage'


import { BrowserRouter as Router, Route, Link, NavLink, HashRouter, Redirect } from "react-router-dom"; 

// import ContentEditable from 'react-contenteditable' // use for inputs that does not require rich text editing. This allows inputs to have the same style 
import _ from 'lodash'
import * as arrayMove from  'array-move'
import Page from './Page'
import { UserInfo } from './side-navigation'

import ImageUploader from './ImageUploader'
import FileUploader from './FileUploader'

import { GlobalContext } from './contexts'

import { getId, gridLayouts } from './helpers'
import { updateHeightOfVideos } from './content-components/RichText';

function moveContentUnderTopToolbar(e) {
    let toolbarContainer = document.getElementsByClassName("App__toolbar-container")[0]
    if (toolbarContainer) {
        let height = toolbarContainer.offsetHeight;
        document.getElementsByClassName('App__grid--main')[0].style['padding-top'] = height + "px";
    } else {
        delete document.getElementsByClassName('App__grid--main')[0].style['padding-top']
    }
}

function setScrollableHeight() {
    const userInfoElement = document.getElementsByClassName("SN-UserInfo")[0]
    const accountInfoElement = document.getElementById("SN__account-info")
    const documentHeight = document.documentElement.clientHeight
    const scrollableHeight = documentHeight - userInfoElement.offsetHeight - accountInfoElement.offsetHeight
    
    this.setState({
        scrollableHeight: scrollableHeight
    })
    
}

function newMerge(obj, update) {
    const newObj = _.assign(obj, update)
    if (update.style && Object.keys(update.style).length === 0) {
        obj.style = {}
    }
    return obj
}

class App extends React.Component {
    constructor(props) {
        super(props)
        
        window.addEventListener("resize", updateHeightOfVideos)
        window.addEventListener("resize", moveContentUnderTopToolbar)
        window.addEventListener("resize", setScrollableHeight.bind(this))
        window.addEventListener("keyup", (e) => {
            if (e.key === "Escape") {
                this.clearFocus();
            }
        })


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
        this.handleColorChange = this.handleColorChange.bind(this)
        this.addSection = this.addSection.bind(this)
        this.addComponent = this.addComponent.bind(this)
        this.makeGridSections = this.makeGridSections.bind(this) // may not need 
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

        this.setPageStateFromTemplate = this.setPageStateFromTemplate.bind(this)
        this.createTemplate = this.createTemplate.bind(this)
        this.deleteTemplate = this.deleteTemplate.bind(this)

        this.setAuthenticated = this.setAuthenticated.bind(this)
        this.setShowLogin = this.setShowLogin.bind(this)
        this.setShowRegister = this.setShowRegister.bind(this)

        this.logout = this.logout.bind(this)

        this.state = {
            scrollableHeight: 0,

            gridLayouts: gridLayouts,
            defaultGridLayout: 'oneColumn',
            defaultSectionPadding: '0px',
            // Application State
            messages: [],
            showLogin: false,
            showRegister: false, 


            user: {},

            pages: [],
            activePage: "",
            templates: [],

            // Context Objects
            globalContextObj: {
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

    // _______________ Authentication ______________________
    logout() {
        axios.post("/logout").then(response => {
            this.setAuthenticated(false)
            this.setShowLogin(false)
            localforage.removeItem("token").catch(error => {
                console.log("Failed to remove token on logout, with error: ", error)
            })
            delete axios.defaults.headers.common["Authorization"]

        }).catch(error => {
            this.flashMessage({text: "Failed to log out, please try again.", type: "error"}, 3)
        })
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

    // updateActivePage() ?


    updateSectionInFocus(sectionId, sectionIndex) {
        this.setState((state, props) => {
            let globalContextObj = state.globalContextObj
            globalContextObj.sectionInFocus = sectionId 
            globalContextObj.sectionInFocusIndex = sectionIndex

            return {
                globalContextObj
            }
        })
    }

    updateGridSectionInFocus(gridSectionId, gridSectionIndex) {
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
                this.loadProtectedData()
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

    setShowLogin(value) {
        this.setState({
            showLogin: value
        })
    }

    setShowRegister(value) {
        this.setState({
            showRegister: value
        })
    }

    createPage(type, pageTitle) {
        console.log(axios.defaults)
        let path;
        let pathTitle = pageTitle.toLowerCase().replace(" ", "-")
        
        if (type === "page") {
            if (pageTitle.toLowerCase() === "home") pathTitle  = "" // Special naming for the home page

            path =  `/${pathTitle}` // replace , and . etc
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
                console.log(response.data)
                state.pages.push(response.data)
                return {
                    pages: state.pages
                }
            })
        })
    }

    updatePageState(pageUpdate, pageIndex) {
        if (!this.state.globalContextObj.editing) return

        this.setState((state, props) => {

            let page = state.pages[pageIndex]
            
            state.pages[pageIndex]= newMerge(page, pageUpdate)
            
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
            console.log("Invalid styles, not able to parse as JSON. Error: ", error)
        }
    }

    deletePage(pageIndex) {
        const pageToDelete = this.state.pages[pageIndex]

        axios.delete(`/pages/${pageToDelete.pathTitle}`).then(response => { // on the backend, everything is a page. On the front end pages are divided into projects and normal pages
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

    // Need to update this when accomodating for more layouts.
    makeGridSections(layoutName) {
        if ((typeof(layoutName) === 'undefined') || (layoutName === null)) {
            layoutName = 'oneColumn'
        }
        let gridLayout = this.state.gridLayouts[layoutName]

        const containerElement = document.getElementsByClassName('Page')[0]
        // const padding = window.getComputedStyle(containerElement).getPropertyValue('padding')
        const padding = this.state.defaultSectionPadding

        const width = containerElement.offsetWidth
        const innerWidth = width - 2*parseInt(padding, 10)
        const columnWidth = innerWidth / gridLayout.numColumns

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
    
    //____________________ SECTION CODE_______________________________ 
    addSection(template) {
        /* Add section under the currently selected one */
        let newSection;

        if (template) {
            newSection = {
                id: getId(),
                style: template.style,
                className: template.className,
                styleInput: "",
                selectedLayout: template.selectedLayout, 
                gridSections: template.gridSections,
            }
        } else {
            newSection = {
                id: getId(),
                style: {},
                className: "",
                styleInput: "",
                selectedLayout: this.state.defaultGridLayout, 
                gridSections: this.makeGridSections(this.state.defaultGridLayout)
            }
        }

        const sectionInFocusIndex = (this.state.globalContextObj.sectionInFocusIndex >= 0) ? this.state.globalContextObj.sectionInFocusIndex : 0

        this.setState((state, props) => {
            state.pages[state.globalContextObj.editing].sections.splice(sectionInFocusIndex+1, 0, newSection)
            return {
                pages: state.pages
            }
        })
    }
    
    // add logic to recreate columns from state objects
    updateSectionLayout(e) {
        const layoutName = e.target.value
        // add logic to change the layout without loosing gridSections // maybe add this functionality in makeGridSections...
        const gridSections = this.makeGridSections(layoutName)
        
        this.setState((state, props) => {
            state.pages[state.globalContextObj.editing].sections[this.state.globalContextObj.sectionInFocusIndex].gridSections = gridSections
            state.pages[state.globalContextObj.editing].sections[this.state.globalContextObj.sectionInFocusIndex].selectedLayout = layoutName
            return {
                pages: state.pages
            }
        })
    }

    // merge this with updateSectionState?
    handleColorChange(color){
        // update the selected Section (and maybe girdSection/component in the future)

        let sectionInFocusIndex = this.state.globalContextObj.sectionInFocusIndex
        let gridSectionInFocusIndex = this.state.globalContextObj.gridSectionInFocusIndex

        if (gridSectionInFocusIndex) {
            this.updateGridSectionState({
                style: {
                    background: color.hex
                }
            }, sectionInFocusIndex, gridSectionInFocusIndex)
        } else if (sectionInFocusIndex) {
            this.updateSectionState({
                style: {
                    background: color.hex
                }
            }, sectionInFocusIndex)
        }
    }

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
            
            state.pages[state.globalContextObj.editing].sections[sectionIndex] = newMerge(section, sectionUpdate)
            return {
                pages: state.pages
            }
        })
    }

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

            state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex] = newMerge(gridSection, gridSectionUpdate)

            return {
                pages: state.pages
            }
        })
    }

    
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
                newComponent = {
                    id: getId(),
                    style: template.style,
                    className: template.className,
                    styleInput: "",
                    type: template.type,
                    state: template.state,
                }
            }
        
            state.pages[state.globalContextObj.editing].sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates.splice(componentInFocusIndex + 1, 0, newComponent)
            return {
                pages: state.pages
            }
        })
    }

    updateComponentState(componentUpdate, sectionIndex, gridSectionIndex, componentStateIndex) {
        if (!this.state.globalContextObj.editing) return

        this.setState((state, props) => {
            let component = state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex].componentStates[componentStateIndex]

            state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex].componentStates[componentStateIndex] = newMerge(component, componentUpdate)

            return {
                pages: state.pages
            }
        })
    }

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

    deleteObject() {
        const { sectionInFocus, componentInFocus } = this.state.globalContextObj

        const { sectionInFocusIndex, gridSectionInFocusIndex, componentInFocusIndex } = this.state.globalContextObj
        this.setState((state, props) => {
            if (componentInFocus !== "") { // delete component
                const componentState = state.pages[state.globalContextObj.editing].sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates[componentInFocusIndex]
                if (window.confirm('Are you sure you want to delete component (' + componentState.id + ') of type: ' + componentState.type + '?')) {
                    state.pages[state.globalContextObj.editing].sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates.splice(componentInFocusIndex, 1)
                    return {
                        pages: state.pages
                    }              
                }
            } else if (sectionInFocus !== "") {
                const section = state.pages[state.globalContextObj.editing].sections[sectionInFocusIndex]
                if (window.confirm('Are you sure you want to delete section (' + section.id + ') with index: ' + sectionInFocusIndex + '?')) {
                    state.pages[state.globalContextObj.editing].sections.splice(sectionInFocusIndex, 1)
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
            if (componentInFocus !== "") { // delete component
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
        console.log("Set page template, template: ", template)
        if (window.confirm(`Are you sure you want to apply "${template.title}" as a template? The current state of the page will be lost.`)) {
            this.setState((state, props) => {
                state.pages[state.globalContextObj.editing]["sections"] = template.template.sections || []
                state.pages[state.globalContextObj.editing]["style"] = template.template.style || {}
                state.pages[state.globalContextObj.editing]["className"] = template.template.className || ""
                console.log("State.pages: ", state.pages[state.globalContextObj.editing])
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
            entity = this.state.pages[this.state.globalContextObj.editing].sections[sectionIndex]
        } else if (type === "component") {
            const sectionIndex = this.state.globalContextObj.sectionInFocusIndex
            const componentIndex = this.state.globalContextObj.componentInFocusIndex            
            entity = this.state.pages[this.state.globalContextObj.editing].sections[sectionIndex].componentStates[componentIndex]
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
            // update list of projects to render list of links
            this.setState({
                pages: response.data // Need to make sure its an array (this can be the server responsibility...)
            })
        }).catch(error => {
            this.setState({ // remove later probably...
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

    loadUser() {
        axios.get("/user").then(response => {
            this.setState({
                user: response.data
            })
        }).catch(error => {
            this.setState({
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

    loadProtectedData() {
        this.loadTemplates()
        // Add more as needed
    }


    //_______________ Data saving/updating/deleting code _________________________

    saveActivePage() {
        const activePage = this.state.globalContextObj.editing
        const page = this.state.pages[activePage]

        axios.put(`/${page.type}/${page.name}`, page).then(response => {
            this.flashMessage({text: "Successfully saved the page!", type: "success"}, 3)
        }).catch(error => {
            this.flashMessage({text: "Failed to save the page, please try again.", type: "error"}, 3)
        })
    }

    

    componentDidMount() {
        this.loadPages()
        this.loadUser()
        // this.loadTemplates()
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
            })
        }).catch(err => {
            console.log("Not a token in local storage! ")
        })

    }

    componentDidUpdate(prevProps, prevState) {
        moveContentUnderTopToolbar()
        
        if (
            !_.isEqual(prevState.user, this.state.user) || 
            (prevState.pages.length !== this.state.pages.length) || 
            (prevState.globalContextObj.authenticated !== this.state.globalContextObj.authenticated)
        ) {
            setScrollableHeight.bind(this)()
        }
    }

    render() {

        return (
            <GlobalContext.Provider value={this.state.globalContextObj}>
                <HashRouter>
                    <div className='App'>
                        {/* Side Navigation Area */}
                        <div className="SN App__grid--side">
                            
                            {UserInfo(this.state.user) /* Logged in user, or the Admin (aka: me) */} 
                            
                            { this.state.globalContextObj.authenticated &&
                                <AuthNav 
                                    scrollableHeight={this.state.scrollableHeight}
                                    pages={this.state.pages}
                                    toggleEdit={this.toggleEdit}
                                    deletePage={this.deletePage}

                                    createPage={this.createPage}
                                    clearFocus={this.clearFocus}
                                    toggleSpacing={this.toggleSpacing}
                                    addSection={this.addSection}
                                    addComponent={this.addComponent}
                                />
                            } 
                            { !this.state.globalContextObj.authenticated && 
                                <ViewNav 
                                    scrollableHeight={this.state.scrollableHeight}
                                    pages={this.state.pages}
                                />
                            }
                            
                            <div id="SN__account-info" className="SN__container">
                                <p className="SN__menu-title">ACCOUNT</p>
                                <div className='SN__widget'> {/* Section__toolbarMenu */}
                                    <ul>
                                        { !this.state.globalContextObj.authenticated &&
                                            <React.Fragment>
                                                <li><a className="SN__item" onClick={()=>{ this.setShowLogin(true) }}><i className="fas fa-sign-in-alt"></i><span>Log In</span></a></li>
                                                <li><a className="SN__item" onClick={()=>{ this.setShowRegister(true) }}><i className="fas fa-sign-in-alt"></i><span>Register</span></a></li>  
                                            </React.Fragment>
                                        } 
                                        { this.state.globalContextObj.authenticated &&
                                            <React.Fragment>
                                                <li><a className="SN__item" onClick={ this.logout }><i class="fas fa-sign-out-alt"></i><span>Log out</span></a></li>
                                                <li>          
                                                    <Link 
                                                        to={{
                                                            pathname: '/account',  
                                                        }} 
                                                        className="SN__item"
                                                        activeClassName="SN__item--active" // not working, do not know why
                                                    >
                                                        <i className="material-icons">person</i><span>Account</span>
                                                    </Link>
                                                </li>
                                            </React.Fragment>

                                        }

                                    </ul>

                                    { this.state.showLogin &&
                                        <div className="SN__login-form">
                                            <Login // Need to be able to update the global context, this is why it is "easier" to render it here.
                                                showLogin={this.state.showLogin}
                                                authenticated={this.state.globalContextObj.authenticated}
                                                setAuthenticated={this.setAuthenticated}
                                                setShowLogin={this.setShowLogin}
                                                // setUser={setUser} // need to implement in the future to support multiple users.
                                            />
                                        </div>
                                    }
                                    { this.state.showRegister &&
                                        <div className="SN__login-form">
                                            <Register // Need to be able to update the global context, this is why it is "easier" to render it here.
                                                showRegister={this.state.showRegister}
                                                setShowRegister={this.setShowRegister}
                                                // setUser={setUser} // need to implement in the future to support multiple users.
                                            />
                                        </div>
                                    }
                                </div>
                            </div>

                        </div>


                        {/* This is the main content area */}
                        <div className='App__grid--main'>
                            
                            {/* Editor Panel Area */}
                                <div className='App__toolbar-container' style={{
                                    display: (this.state.globalContextObj.editing) ? "block" : "none"
                                }}>
                                    
                                    {/* Quill toolbar here - it is tied together by the portal referencing this 
                                    element (using get element by id) and different components getting the 
                                    Portal and using it directly in their render methods. It's quite disorderly.*/}
                                    <div id='Toolbar__portal'></div>
                                </div>

                            {
                                this.state.pages.map((page, pageIndex) => {
                                    return (
                                        <Route key={page.id} exact path={page.path} render={(props) => <Page {
                                            ...props}
                                            id={page.id}
                                            pageIndex={pageIndex}
                                            page={page}

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

                                            moveObject={this.moveObject}
                                            deleteObject={this.deleteObject}
                                        />} />
                                    )
                                })
                            }
                            { this.state.globalContextObj.authenticated &&
                                <React.Fragment>
                                    <Route exact path="/image-uploader" render={(props) => <ImageUploader {...props} flashMessage={this.flashMessage} />} />
                                    <Route exact path="/file-uploader" render={(props) => <FileUploader {...props} flashMessage={this.flashMessage} />} />
                                    <Route exact path="/account" render={(props) => <AccountInfo {...props} flashMessage={this.flashMessage} />} />
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
                    </div>
                </HashRouter>
            </GlobalContext.Provider >
            
        )
    }
}


App.contextType = GlobalContext

export default App