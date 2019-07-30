import React from 'react'
import axios from 'axios'
import update from 'immutability-helper';
import { BrowserRouter as Router, Route, Link, NavLink, HashRouter, Redirect } from "react-router-dom"; 


import ContentEditable from 'react-contenteditable' // use for inputs that does not require rich text editing. This allows inputs to have the same style 
import _ from 'lodash'
import * as arrayMove from  'array-move'
import Page from './Page'
import { UserInfo, AccountInfo } from './side-navigation'

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

class App extends React.Component {
    constructor(props) {
        super(props)
        
        window.addEventListener("resize", updateHeightOfVideos)
        window.addEventListener("resize", moveContentUnderTopToolbar)
        window.addEventListener("keyup", (e) => {
            if (e.key === "Escape") {
                this.clearFocus();
            }
        })


        // Page Related
        // combine in a change state method?
        this.changeProjectTitle = this.changeProjectTitle.bind(this)
        this.changePageTitle = this.changePageTitle.bind(this)

        this.createPage = this.createPage.bind(this)
        this.deletePage = this.deletePage.bind(this)
        this.updatePageState = this.updatePageState.bind(this)
        
        this.clearFocus = this.clearFocus.bind(this)
        this.toggleEdit = this.toggleEdit.bind(this)
        this.toggleSpacing = this.toggleSpacing.bind(this)
        this.setActiveRichTextEditor = this.setActiveRichTextEditor.bind(this)
        this.updateComponentInFocus = this.updateComponentInFocus.bind(this)
        this.updateSectionInFocus = this.updateSectionInFocus.bind(this)
        this.updateGridSectionInFocus = this.updateGridSectionInFocus.bind(this) 
        this.updateProjectInFocus = this.updateProjectInFocus.bind(this)

        // Update Section Related
        this.handleColorChange = this.handleColorChange.bind(this)
        this.addSection = this.addSection.bind(this)
        this.addComponent = this.addComponent.bind(this)
        this.makeGridSections = this.makeGridSections.bind(this) // may not need 
        this.updateSectionLayout = this.updateSectionLayout.bind(this)
        this.updateSectionWidths = this.updateSectionWidths.bind(this)

        // Update Component Related
        this.updateComponentState = this.updateComponentState.bind(this)
        this.updateSectionState = this.updateSectionState.bind(this)
        this.updateGridSectionState = this.updateGridSectionState.bind(this)
        this.deleteObject = this.deleteObject.bind(this)
        this.moveObject = this.moveObject.bind(this)


        this.state = {
            gridLayouts: gridLayouts,
            defaultGridLayout: 'oneColumn',
            defaultSectionPadding: '0px',
            // Application State

            user: {
                firstName: "Didrik",
                lastName: "Fleischer",
                description: "MSc in Industrial Economics and Professional Developer",
            },

            newPageTitle: '', 
            newProjectTitle: '',


            pages: [
                {
                    id: 1,
                    type: "page",
                    path: '/',
                    title: "Home",
                    sections: [],
                    show: true,
                },
                {
                    id: 2,
                    type: "project",
                    path: "/projects/test-project",
                    title: 'Test Project',
                    sections: [],
                    show: true,
                }
            ],
            activePage: "",

            
            /*
            {
                        id: "1",
                        style: {},
                        className: "",
                        selectedLayout: "oneColumn",
                        gridSections: [{
                            id: "a",
                            style: {},
                            className: "",
                            coordinates: []
                        }]
                    }
            {
                id: getId(),
                state: '',
                show: true,
                title: 'Project Title 1',
            }*/

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
            }*/
            // Context Objects
            globalContextObj: {
                pathPrefix: '',
                toggleEdit: this.toggleEdit,
                editing: false,
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
            }
        }
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

    updateProjectInFocus(projectId, projectIndex) {
        this.setState((state, props) => {
            let globalContextObj = state.globalContextObj
            globalContextObj.projectInFocus = projectId 
            globalContextObj.projectInFocusIndex = projectIndex

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
    changePageTitle(e) {
        this.setState({
            newPageTitle: e.target.value,
        })
    }

    // Create new projects in the side navigation
    changeProjectTitle(e) {
        this.setState({
            newProjectTitle: e.target.value
        })
    }

    createPage(type) {
        // update navigation 

        this.setState((state, props) => {
            let title = ""
            let path = ""
            if (type === "project") {
                title = state.newProjectTitle
                path =  "/" + type + "/" + title.toLowerCase().replace(" ", "-")
            } else if (type === "page") {
                title = state.newPageTitle
                path =  "/" + title.toLowerCase().replace(" ", "-")
            }

            let page = {
                id: getId(),
                path: path,
                type: type,
                title: title, // based on type...
                sections: [],
                show: true,
            }
            state.pages.push(page)
            return {
                pages: state.pages
            }
            /*
            axios.post('/pages', page).then(response => {
                state.pages.push(response.data)

                return {
                    pages: state.pages,
                }
            }).catch(error => {
                console.log(error)
                return {
                    statusMessage: error.message,
                }
            })
            */

            
        })
    }

    updatePageState(pageUpdate, pageIndex) {
        if (!this.state.globalContextObj.editing) return

        this.setState((state, props) => {

            let page = state.pages[pageIndex]
            
            state.pages[pageIndex]= _.merge(page, pageUpdate)
            
            return {
                pages: state.pages
            }
        })
    }

    deletePage(pageIndex) {
        this.setState((state, props) => {
            state.pages.splice(pageIndex, 1)
            return {
                pages: state.pages
            }
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
                state: "<p>Write some rich text here...</p>",
            }],
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
            })
        }
        return gridSections
    }
    
    //____________________ SECTION CODE_______________________________ 
    addSection() {
        /* Add section under the currently selected one */
        let newSection = {
            id: getId(),
            style: {},
            selectedLayout: this.state.defaultGridLayout, 
            // cards: [], // don't know where it is best to store the cards. 
            gridSections: this.makeGridSections(this.state.defaultGridLayout)
        }


        const sectionInFocusIndex = this.state.globalContextObj.sectionInFocusIndex

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
        this.setState((state, props) => {
            // console.log("active page: ", this.getActivePageIndexFromPath(window.location.hash.replace("#", "")))
            const activePage = this.getActivePageIndexFromPath(window.location.hash.replace("#", ""))
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
            
            state.pages[state.globalContextObj.editing].sections[sectionIndex] = _.merge(section, sectionUpdate)
            
            return {
                pages: state.pages
            }
        })
    }

    updateGridSectionState(gridSectionUpdate, sectionIndex, gridSectionIndex) {
        if (!this.state.globalContextObj.editing) return

        this.setState((state, props) => {
            let gridSection = state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex]

            state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex] = _.merge(gridSection, gridSectionUpdate)

            return {
                pages: state.pages
            }
        })
    }


    addComponent(componentType) {
        // get grid section and update its componentStates

        this.setState((state, props) => {
            let { sectionInFocusIndex, gridSectionInFocusIndex, componentInFocusIndex} = this.state.globalContextObj
            
            if ((sectionInFocusIndex === -1) || (gridSectionInFocusIndex === -1)) {
                return
            }

            if (componentInFocusIndex === -1) {
                componentInFocusIndex = 0
            }

            if (componentType === 'rich text') {
                var newComponent = {
                    id: getId(),
                    type: 'rich text',
                    state: "<div>Rich text...</div>"
                }
            } else if (componentType === 'image') {
                // ...
            }
            console.log(newComponent)
        
            state.pages[state.globalContextObj.editing].sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates.splice(componentInFocusIndex + 1, 0, newComponent)
            return {
                pages: state.pages
            }
        })
    }

    updateComponentState(componentUpdate, sectionIndex, gridSectionIndex, componentStateIndex) {
        if (!this.state.globalContextObj.editing) return

        this.setState((state, props) => {

            // console.log('component update: ', componentUpdate.state, sectionIndex, gridSectionIndex, componentStateIndex)
            for (let key in componentUpdate) {
                state.pages[state.globalContextObj.editing].sections[sectionIndex].gridSections[gridSectionIndex].componentStates[componentStateIndex][key] = componentUpdate[key]
            }
            return {
                pages: state.pages
            }
        })
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


    //__________________ Data loading code___________________________________
    
    loadProjects() {
        axios.get('/projects').then(response => {
            // update list of projects to render list of links
            this.setState({
                projects: response.data
            })
        }).catch(error => {
            console.log(error)
        })
    }

    // probably delete    
    loadCards() {
        axios.get('/cards').then(response => {
            this.setState({
                cards: response.data
            })
        }).catch(console.log)

    }

    getActivePageIndexFromPath(path) {
        for (let i = 0; i < this.state.pages.length; i++) {
            if (this.state.pages[i].path === path) {
                return i
            }
        }
        return false
    }
    componentDidMount() {
        this.loadProjects()
    }

    componentDidUpdate(pastProps) {
        moveContentUnderTopToolbar()
    }

    render() {
        // render one layout for editor mode, and another layout for view mode
        // <a href="#">Link 1</a>
        // <Login></Login>
        // <Register></Register> 
        // implement global select of sections and components, and be able to give them commands to execute. Or update their state through props and keep all state at
        // the homepage or app lavel


        return (
            <GlobalContext.Provider value={this.state.globalContextObj}>
                <HashRouter>
                    <div className='App'>

                        
                        {/* Side Navigation Area */}
                        <div className="SN App__grid--side">
                            
                            {UserInfo(this.state.user) /* Logged in user, or the Admin (aka: me) */} 
                            
                            { !this.state.globalContextObj.editing &&
                                <div className="SN SN-Scrollable">
                                    <div className="SN__container">
                                        <p className="SN__menu-title">PAGES</p>
                                        <div className='SN__widget'>
                                            <ul>
                                                {
                                                    this.state.pages.map((page, pageIndex) => {
                                                        if (page.type !== "page") {
                                                            return null
                                                        }
                                                        return (
                                                            <li key={page.id}>
                                                                <Link
                                                                    to={page.path} 
                                                                    className="SN__item"
                                                                    activeClassName="SN__item--active"
                                                                    onlyActiveOnIndex
                                                                >
                                                                    <i className="material-icons">pages</i><span>{page.title + " "}</span>
                                                                    <button className="SN__button SN__edit-button" onClick={this.toggleEdit} value={pageIndex}>
                                                                        <i className="material-icons">edit</i>
                                                                    </button>
                                                                    <button className="SN__button SN__delete-button" onClick={() => {this.deletePage(pageIndex)}}>
                                                                        <i className="material-icons">delete</i>
                                                                    </button>
                                                                </Link>
                                                            </li>
                                                        )
                                                    })
                                                }
                                                
                                            </ul>
                                            <div>
                                                <input className="SN__input" placeholder="Page Title" value={this.state.newPageTitle} onChange={this.changePageTitle}/>
                                                <button className="SN__button SN__add-button" onClick={() => this.createPage("page")}>
                                                    <i className="material-icons">add_box</i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="SN__container">
                                        <p className="SN__menu-title">PROJECTS</p>
                                        <div className="SN__widget">
                                            <ul>
                                                {
                                                    this.state.pages.map((page, pageIndex) => {
                                                        if (page.type !== 'project') {
                                                            return null
                                                        }
                                                        return (
                                                            <li key={page.id}>
                                                                    <Link 
                                                                        to={page.path} 
                                                                        className="SN__item"
                                                                        activeClassName="SN__item--active" // not working, do not know why
                                                                        onlyActiveOnIndex
                                                                    >
                                                                        <i className="material-icons">pages</i><span>{page.title}</span>
                                                                        <button className="SN__button SN__edit-button" onClick={this.toggleEdit} value={pageIndex}>
                                                                            <i className="material-icons">edit</i>
                                                                        </button>
                                                                        <button className="SN__button SN__delete-button" onClick={() => {this.deletePage(pageIndex)}}>
                                                                            <i className="material-icons">delete</i>
                                                                        </button>
                                                                    </Link>
                                                            </li>
                                                        )
                                                    })
                                                }
                                            </ul>
                                            <div>
                                                <input className="SN__input" placeholder="Project Title"  value={this.state.newProjectTitle} onChange={this.changeProjectTitle}/>
                                                <button className="SN__button SN__add-button" onClick={() => this.createPage("project")}>
                                                    <i className="material-icons">add_box</i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                            

                            { this.state.globalContextObj.editing && 
                                <React.Fragment>
                                    <div className="SN__container">
                                        <div className='SN__widget'>
                                            <i className="material-icons SN__back-arrow" onClick={this.toggleEdit}>arrow_back</i>
                                        </div>
                                    </div>
                                    <div className="SN__container">
                                        <p className="SN__menu-title">GLOBAL</p>
                                        <div className='SN__widget'> {/* Section__toolbarMenu */}
                                            <ul>
                                                <li><a className="SN__item" onClick={this.clearFocus}><i className="material-icons">clear</i><span>Clear Focus</span></a></li>
                                                <li><a className="SN__item" onClick={this.toggleSpacing}><i className="material-icons">border_all</i><span>Toggle Spacing</span></a></li>
                                                
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="SN__container">
                                        <p className="SN__menu-title">SECTION</p>
                                        <div className='SN__widget'> {/* Section__toolbarMenu */}
                                            <ul>
                                                <li><a className="SN__item" onClick={this.addSection}><i className="material-icons">add_box</i><span>Add Section</span></a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="SN__container">
                                        <p className="SN__menu-title">COMPONENTS</p>
                                        <div className='SN__widget'> {/* Section__toolbarMenu */}
                                            <ul>
                                                <li><a className="SN__item" onClick={() => this.addComponent("rich text")}><i className="material-icons">text_fields</i><span>Add Rich Text</span></a></li>
                                                <li><a className="SN__item" onClick={() => this.addComponent("image")}><i className="material-icons">insert_photo</i> <span>Add Image</span></a></li>
                                            </ul>
                                        </div>
                                    </div>  
                                    <div className="SN__container">
                                        <p className="SN__menu-title">FILES</p>
                                        <div className='SN__widget'> {/* Section__toolbarMenu */}
                                            <ul>
                                                <li>          
                                                    <Link 
                                                        to={{
                                                            pathname: '/images',  
                                                        }} 
                                                        className="SN__item"
                                                        activeClassName="SN__item--active" // not working, do not know why
                                                    >
                                                        <i className="material-icons">cloud_upload</i><span>Upload Images</span>
                                                    </Link>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>  
                                </React.Fragment>
                            }

                            {AccountInfo()}
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
                                            
                                            enableSpacing={this.state.globalContextObj.enableSpacing}

                                            updatePageState={this.updatePageState}
                                            updateSectionLayout={this.updateSectionLayout}
                                            updateSectionWidths={this.updateSectionWidths}
                                            updateSectionState={this.updateSectionState}
                                            updateGridSectionState={this.updateGridSectionState}
                                            updateComponentState={this.updateComponentState}

                                            moveObject={this.moveObject}
                                            deleteObject={this.deleteObject}
                                        />} />
                                    )
                                })
                            }
                            
                            {/* get from the Link
                                id
                                projectIndex
                                projectState
                                updateProjectState
                            */}
                        </div>
                    </div>
                </HashRouter>
            </GlobalContext.Provider >
            
        )
    }
}


App.contextType = GlobalContext

export default App

/* 

// All of these things must go through the HomePage component

// Section Spedific:
background
selectedLayout
id
gridSections

// Common for all components:
updateComponentState
deleteObject

*/


// render={(props) => <ProjectPage {...props} updateNavigation={this.updateNavigation} />}


/*
<ul >
    <li>
        <Link to="/">Home</Link>
    </li>

</ul>

<div className="Editor__dropdown">
    <button className="Editor__dropdown-btn">Dropdown</button>
    <div className="Editor__dropdown-gridSections">
        {this.state.projects.map(project => (
            <span key={project._id}><Link to={'/projects/' + project._id}>{project.title}</Link></span>
        ))}
    </div>
</div>

<button onClick={this.toggleEdit}>{this.state.globalContextObj.editing ? 'Disable Editing' : 'Enable Editing'}</button>


<label>Make new Project</label>
<input value={this.state.projectTitle} onChange={this.changeProjectTitle}></input>
<button onClick={this.createProject}>New Project Page</button>

<ul>
    <li>
        <a href='#'>Login</a>
    </li>
    <li>
        <a href='#'>Logout</a>
    </li>
</ul>




// This is only called once when the sections grid is first
// Build the components of a grid section from componentStates. 
// created or when loading the state from the database. 
// Not used atm, should not be needed.
buildComponents(gridSections) {
    // need to iterate over both gridSections and their componentStates. 
    gridSections.forEach(gridSection => {
        gridSection.components = gridSection.componentStates.map(componentState => {
            if (componentState.type === 'rich text') {
                var component = (<RichText 
                    // key={componentState.id}
                    componentState={componentState} 
                    updateComponentState={this.updateComponentState} 
                    delete={this.deleteObject.bind(this, componentState.id)}
                    id={componentState.id}
                />)
            } else if (componentState.type === 'unsplash image') {

            }

            return component
        })
    })

    return gridSections
}

findComponentStateIndex(state, id) {
    let gridSectionsIndex = undefined
    let componentStateIndex = undefined
    for(let i=0; i<state.gridSections.length; i++) {
        for(let j=0; j<state.gridSections[i].componentStates.length; j++) {
            if (state.gridSections[i].componentStates[j].id === id) {
                gridSectionsIndex = i
                componentStateIndex = j 
                break
            }
        }
        if (typeof gridSectionsIndex !== 'undefined') break
    }
    return [gridSectionsIndex, componentStateIndex]
}

findComponentIndex(state, id) {
    let gridSectionsIndex = undefined
    let componentIndex = undefined
    for(let i=0; i<state.gridSections.length; i++) {
        for(let j=0; j<state.gridSections[i].components.length; j++) {
            if (state.gridSections[i].components[j].id === id) {
                gridSectionsIndex = i
                componentIndex = j
                break
            }
        }
        if (typeof gridSectionsIndex !== 'undefined') break
    }
    return [gridSectionsIndex, componentIndex]
}

 /*
if (page.type === "page") {
} else if (page.type === 'project') {
    return (
        <Route key={page.id} exact path={page.path} render={(props) => <Page {
            ...props} 
            id={page.id}
            sections={page.sections}
            updateSectionLayout={this.updateSectionLayout}
            updateComponentState={this.updateComponentState}
            updateSectionState={this.updateSectionState}
            moveObject={this.moveObject}
            deleteObject={this.deleteObject}
        />} />
        /*
        <Route key={page.id} path="/projects/:id" render={(props) => {( // I need to render the link-path in similar way above
            props.location.state ? (
                <Page {...props}/>
            ) : (
                <Redirect to="/"/>
            )
        )} />
        */
