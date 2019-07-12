import React from 'react'
import axios from 'axios'
import update from 'immutability-helper';
import { BrowserRouter as Router, Route, Link, HashRouter, Redirect } from "react-router-dom"; 
import ContentEditable from 'react-contenteditable' // use for inputs that does not require rich text editing. This allows inputs to have the same style 
import _ from 'lodash'
import * as arrayMove from  'array-move'

// as the elements in "view mode". This does not support undo/redo
// Use quill for creating artichles // would be really nice to embed the tool bar into the editor bar...
import { SketchPicker } from 'react-color'
import ProjectPage from './ProjectPage'
import HomePage from './HomePage'
import { GlobalContext } from './contexts'

import { getId, gridLayouts } from './helpers'


/*
Ides: 
theme context
logged in user context
have different themes based on time of day

ToDo: 
build out the REST API - enable writing of methods not only working with local state, but also thinks about updating the server when changes happen
Need to figure out how to save the home and project pages
    - save button for each project
    - save button for the home page

Everything can be expressed through quill, I just need to add functionality to it (if enough functionality is added to quill, I do not need to have react components to build web pages!)
    - image and video size and positioning
    - multiple images on the same row?
    - add styles to images, like a coloured border with border radius
    - maybe images should be uploaded to the server and referenced from there...instead of having images base 64 encoded. This would also allow 
      editing of images (cropping and resizing), they could also be reused across the page.
    - just like adding an image from unsplashed, i can list images available on the server...
    - showing a configuration popup when having selected an image makes it easy to locate specific formatting options, and even show react components 
      to view images before selecting which to insert.
    - it may be that some functionality should be in the RichText editor, like background image, padding, margin or the "container" etc. (the quill editor is transparent)
    - should probably code most styling into classes, that way theming and code reuse is easier


Projects:
    - Add projects in the side navigation
    - Have it as permanent navigation, for normal visitors as well?

Navigation
    - go to project pages
    - go to home page 

Build the Project Article Writer: (should not be too difficult, considering all that has been overcome at this point)
    - Need to figure out how to link things together

View mode, where editing is not possible and rendering is fast

gridSections have same data structure and functionality as project pages

Editor:
    - turn on and off View Mode
    - add options to quill 
    - add buttons/dropdowns for section editing etc. 
    - make it look better
    - Push content down when the editor panel is visible


Update values of media queries

Make login and register forms in the side navigation perhaps, or make them into models and take advantage of portals...

Write out the api and CRUD from the react app

Extend what a section can be: 
    - Control the padding of sections (in percent and pixels maybe)
    - Control padding etc of girdSections and Components?
    - be able to take the form of a banner
    - be able to take the form of a footer
    - maybe be able to set the type of html tag encloses the section
    - Image as a background for sections
    - add two column layout for sections


Add components: 
    - Navigation
    - Image w/ cropping and upload // this is important to get right and easy 
    - Add files and links/buttons to download files
    - Banner creation
    - Cards of different kinds (need to figure out how to do image and normal links -> which syncs up with code deployment -> need a system for links...)

- Be able to add components to grid sections in a nice way // add some options what become available when a section is focused that hover over the component w/ see through

- control the ordering of components in grid sections

Add theming: 
    - A color pallet that defines the colouring of the site
    - Need to think about design some more
    


Automated code deployment and server setup from the app (Ottwell did it...)
SSH to server from the app to to configuration if automation fails or other admin is needed
    - how to store keys etc. securely?


Make users able to host node projects and their own portfolio side...
    - this would involve subdomains and dns/dns-proxy services maybe

Automatically provision and set up instances in the cloud...

Fully featured coder portfolio application. 

*/


class App extends React.Component {
    constructor(props) {
        super(props)
        
        // New Project Related
        this.changeProjectTitle = this.changeProjectTitle.bind(this)
        this.createProject = this.createProject.bind(this)
        this.updateProjectState = this.updateProjectState.bind(this)
        this.deleteProject = this.deleteProject.bind(this)
        this.handleProjectTitleChange = this.handleProjectTitleChange.bind(this)
        this.createProject = this.createProject.bind(this)   
        
        // Editing Related
        this.updateNavigation = this.updateNavigation.bind(this)
        this.clearFocus = this.clearFocus.bind(this)
        this.toggleEdit = this.toggleEdit.bind(this)
        this.setActiveRichTextEditor = this.setActiveRichTextEditor.bind(this)
        this.updateComponentInFocus = this.updateComponentInFocus.bind(this)
        this.updateSectionInFocus = this.updateSectionInFocus.bind(this)
        this.updateGridSectionInFocus = this.updateGridSectionInFocus.bind(this) 
        this.updateProjectInFocus = this.updateProjectInFocus.bind(this)

        // Update Section Related
        this.handleColorChange = this.handleColorChange.bind(this)
        this.toggleColorPicker = this.toggleColorPicker.bind(this) 
        this.addSection = this.addSection.bind(this)
        this.addComponent = this.addComponent.bind(this)
        this.makeGridSections = this.makeGridSections.bind(this) // may not need 
        this.updateLayout = this.updateLayout.bind(this)

        // Update Component Related
        this.updateComponentState = this.updateComponentState.bind(this)
        this.updateSectionState = this.updateSectionState.bind(this)
        this.deleteObject = this.deleteObject.bind(this)
        this.moveObject = this.moveObject.bind(this)


        this.state = {
            gridLayouts: gridLayouts,
            defaultGridLayout: 'oneColumn',
            defaultSectionPadding: '15px',
            // Application State
            showColorPicker: false,
            colorPickerColor: '#FFFFFF',
            newProjectTitle: '', 
            projects: [{
                id: 123,
                title: 'Test Project',
                state: '',
                show: true,
            }],
            
            /*{
                id: getId(),
                state: '',
                show: true,
                title: 'Project Title 1',
            }*/

            // Add functionality for multiple pages?
            sections: [],
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
    } 
    
    // ________________Global context related_____________________
    toggleEdit() {
        this.setState((state, props) => {
            let globalContextObj = state.globalContextObj
            globalContextObj.editable = globalContextObj.editable ? false : true
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

    updateSectionInFocus(sectionId, sectionIndex) {
        this.setState((state, props) => {
            let globalContextObj = state.globalContextObj
            globalContextObj.sectionInFocus = sectionId 
            globalContextObj.sectionInFocusIndex = sectionIndex

            return {
                colorPickerColor: state.sections[state.globalContextObj.sectionInFocusIndex].style.background,
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
    //___________________Navigation and Editor Panel Related________________________

    // Create new projects in the side navigation
    changeProjectTitle(e) {
        this.setState({
            newProjectTitle: e.target.value
        })
    }

    createProject_old() {
        axios.post('/projects', {
            title: this.state.newProjectTitle
        }).then(response => {
            this.setState((state, props) => {
                return {
                    projects: [...state.projects, response.data]
                }
            })
            const projectId = response.data.id
            // create project page and "redirect" to it
            

        }).catch(error => {
            console.log(error)
        })
    }

    addSection() {
        /* Add section under the currently selected one */
        let newSection = {
            id: getId(),
            style: {
                background: '#FFF',
                padding: '15px', 
            },
            selectedLayout: 'oneColumn', 
            // cards: [], // don't know where it is best to store the cards. 
            gridSections: this.makeGridSections(this.state.defaultGridLayout)
        }


        const sectionInFocusIndex = this.state.globalContextObj.sectionInFocusIndex
        this.setState((state, props) => {
            state.sections.splice(sectionInFocusIndex+1, 0, newSection)
            return {
                sections: state.sections
            }
        })
    }

    addComponent(event) {
        // get grid section and update its componentStates
        const componentType = event.target.name
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
        
            state.sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates.splice(componentInFocusIndex + 1, 0, newComponent)
            return {
                sections: state.sections
            }
        })
    }

    deleteObject() {
        const { sectionInFocus, componentInFocus } = this.state.globalContextObj

        const { sectionInFocusIndex, gridSectionInFocusIndex, componentInFocusIndex } = this.state.globalContextObj
        this.setState((state, props) => {
            if (componentInFocus !== "") { // delete component
                const componentState = state.sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates[componentInFocusIndex]
                if (window.confirm('Are you sure you want to delete component (' + componentState.id + ') of type: ' + componentState.type + '?')) {
                    state.sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates.splice(componentInFocusIndex, 1)
                    return {
                        sections: state.sections
                    }              
                }
            } else if (sectionInFocus !== "") {
                const section = state.sections[sectionInFocusIndex]
                if (window.confirm('Are you sure you want to delete section (' + section.id + ') with index: ' + sectionInFocusIndex + '?')) {
                    state.sections.splice(sectionInFocusIndex, 1)
                    return {
                        sections: state.sections
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
                let componentStates = state.sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates
                let newIndex = (componentInFocusIndex+places)%componentStates.length
                state.sections[sectionInFocusIndex].gridSections[gridSectionInFocusIndex].componentStates = arrayMove(
                    componentStates, 
                    componentInFocusIndex, 
                    newIndex
                )
                // update componentInFocusIndex
                this.state.globalContextObj.updateComponentInFocus(componentInFocus, newIndex)

                return {
                    sections: state.sections
                }              
            } else if (sectionInFocus !== "") {
                let newIndex = (sectionInFocusIndex+places)%state.sections.length
                state.sections = arrayMove(state.sections, sectionInFocusIndex, newIndex)
                this.state.globalContextObj.updateSectionInFocus(sectionInFocus, newIndex)
                return {
                    sections: state.sections
                }
            }
            
        })
    }

    // May not need to do this...
    updateNavigation() { 
        this.loadProjects()
    }
 
    // NOTE: need to update
    handleColorChange(color){
        // update the selected Section (and maybe girdSection/component in the future)
        this.updateSectionState({
            style: {
                background: color.hex
            }
        }, this.state.globalContextObj.sectionInFocusIndex)

        this.setState({ 
            colorPickerColor: color.hex
        });
    }
 
    toggleColorPicker() {
        this.setState((state, props) => {
            return {
                showColorPicker: state.showColorPicker ? false : true,
                colorPickerColor: state.sections[state.globalContextObj.sectionInFocusIndex].style.background,
            }
        }) 
    }

    //____________________ SECTION CODE_______________________________ 
    /*
    Need to pass update handler and state to components and sections.
    components have their state updated
    sections have their layout, background and title updated

    */
    updateSectionState(sectionUpdate, sectionIndex) { // only supports updates at one level! this is a problem 
        this.setState((state, props) => {
            for (let key in sectionUpdate) {
                if ((key === 'innerWidth') || (key === 'columnWidth')) {
                    // loop over grid sections and update the values
                    state.sections[sectionIndex].gridSections = state.sections[sectionIndex].gridSections.map(gridSection => {
                        if (gridSection.coordinates[1] === 1) {
                            gridSection = update(gridSection, {style: {width: {$set: sectionUpdate['innerWidth']}}})

                        } else if (gridSection.coordinates[1] === 2) { // only the second "row" has dynamic width
                            gridSection = update(gridSection, {style: {width: {$set: sectionUpdate['columnWidth']}}})
                        } 
                        return gridSection
                    })
                    continue
                }
                // state.sections[sectionIndex][key] = sectionUpdate[key] // replaced be merge for deep assignment
            }

            delete sectionUpdate['innerWidth']
            delete sectionUpdate['columnWidth']

            state.sections[sectionIndex] = _.merge(state.sections[sectionIndex], sectionUpdate)


            return {
                sections: state.sections
            }
        })
    }
    
    updateComponentState(componentUpdate, sectionIndex, gridSectionIndex, componentStateIndex) {
        this.setState((state, props) => {

            // console.log('component update: ', componentUpdate, sectionIndex, gridSectionIndex, componentStateIndex)
            for (let key in componentUpdate) {
                state.sections[sectionIndex].gridSections[gridSectionIndex].componentStates[componentStateIndex][key] = componentUpdate[key]
            }
            return {
                sections: state.sections
            }
        })
    }

    // Need to update this when accomodating for more layouts.
    makeGridSections(layoutName) {
        if ((typeof(layoutName) === 'undefined') || (layoutName === null)) {
            layoutName = 'oneColumn'
        }
        let gridLayout = this.state.gridLayouts[layoutName]

        const containerElement = document.getElementsByClassName('Sections')[0]
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

    // add logic to recreate columns from state objects
    updateLayout(event) {
        const layoutName = event.target.name
        // add logic to change the layout without loosing gridSections // maybe add this functionality in makeGridSections...
        const gridSections = this.makeGridSections(layoutName)
        
        this.setState((state, props) => {
            state.sections[this.state.globalContextObj.sectionInFocusIndex].gridSections = gridSections
            state.sections[this.state.globalContextObj.sectionInFocusIndex].selectedLayout = layoutName
            return {
                sections: state.sections
            }
        })
    }

    //__________________ Project Related Code _____________________________

    handleProjectTitleChange(event) {
        this.setState({
            newProjectTitle: event.target.value
        })
    }
    
    createProject() {
        this.setState((state, props) => {
            let newProject = {
                id: getId(),
                title: state.newProjectTitle,
                state: '',
                show: true,
            }

            axios.post('/projects', newProject).then(response => {
                state.projects.push(response.data)

                return {
                    projects: state.projects,
                }
            }).catch(error => {
                console.log(error)
                return {
                    statusMessage: error.message,
                }
            })

            
        })
    }
    
    updateProjectState(projectUpdate, projectIndex) {
        this.setState((state, props) => {
            for (let key in projectUpdate) {
                state.projects[projectIndex][key] = projectUpdate[key]
            }
            return {
                projects: state.projects
            }
        })
    }

    deleteProject(projectIndex) { // button in the side navigation...
        this.setState((state, props) => {
            state.projects.splice(projectIndex, 1)
            return {
                projects: state.projects          
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
    componentDidMount() {
        this.loadProjects()
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

                        {/* Editor Panel Area */}
                        {this.state.globalContextObj.editable && // render in the Editor panel
                            <div className='Editor App__grid--top'>
                                {/* Quill toolbar here  */}
                                <div id='Toolbar__portal'></div>

                                <div className="Section__toolbar">
                                    <div className='Section__toolbarMenu'>
                                        <i className="fas fa-palette Section__toolbarButton" onClick={this.toggleColorPicker}/>
                                        <button className="Section__toolBarButton" onClick={this.addSection}>Add Section</button> 

                                        <button className="Section__toolbarButton" onClick={this.updateLayout} name='oneColumn'>1 Column</button>
                                        <button className="Section__toolbarButton" onClick={this.updateLayout} name='twoColumns'>2 Column</button>
                                        <button className="Section__toolbarButton" onClick={this.updateLayout} name='threeColumns'>3 Column</button>

                                        <button className="Section__toolBarButton" onClick={this.clearFocus}>Clear Focus</button>
                                        <button className="Section__toolBarButton" onClick={this.deleteObject}>Delete</button> {/* Needs work, sould work for both sections and components, should raise a warning */}
                                        
                                        <button className="Section__toolBarButton" onClick={this.addComponent} name='rich text'>Add Rich Text</button>

                                        <button className="Section__toolBarButton" onClick={() => {this.moveObject(-1)}}>Move Up</button>
                                        <button className="Section__toolBarButton" onClick={() => {this.moveObject(1)}}>Move Down</button>
                                        
                                        
                                    </div>
                                    <div className='Section__toolbarWidgets'>
                                        {this.state.showColorPicker &&
                                            <SketchPicker
                                                color={this.state.colorPickerColor}
                                                onChangeComplete={this.handleColorChange}
                                            />
                                        }
                                    </div>
                                </div>
                            </div>
                        }


                        {/* Side Navigation Area */}
                        <div className="SN App__grid--side">
                            <div className="SN-Header">
                                <img className="SN-Header__logo-image" src="http://via.placeholder.com/106x21" />
                                <ul className="SN-Header__menu SN-pull-right">
                                    <li><a className="SN-Header__menu-item SN-Header__menu-item--active"><i className="material-icons">home</i></a></li>
                                    <li><a className="SN-Header__menu-item"><i className="material-icons">email</i><div className="SN-Buble Buble--red"></div></a></li>
                                </ul>
                            </div>

                            <div className="SN SN-Scrollable">
                                <div className="SN-UserInfo">
                                    <div className="SN-Buble SN-Buble--green"></div>
                                    <div className="SN-UserInfo__image-frame"><img className="SN-UserInfo__image" src="http://via.placeholder.com/42x42"/></div>
                                    <div className="SN-UserInfo__container SN-inline-block">
                                        <div className="SN-UserInfo__username">Didrik <span>Fleischer</span></div>
                                        <div className="SN-UserInfo__status">Life goes on...</div>
                                    </div>
                                </div>

                                <div className="SN__container">
                                    <p className="SN__menu-title">Navigation</p>
                                    <ul>
                                        <li>
                                            <span className="SN__item">
                                                <Link to={'/'} className="SN__title">
                                                    Home
                                                </Link>
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="SN__container">
                                    <p className="SN__menu-title">PROJECTS</p>
                                    <div className="SN__widget">
                                        <ul>
                                            {
                                                this.state.projects.map((project, projectIndex) => {
                                                    return (
                                                        <li key={project.id}>
                                                            <span className="SN__item">
                                                                <Link 
                                                                    to={{
                                                                        pathname: '/projects/' + project.id,
                                                                        state: {
                                                                            id: project.id,
                                                                            projectIndex: projectIndex,
                                                                            project: project,
                                                                            updateProjectState: this.updateProjectState,
                                                                        }
                                                                    }} 
                                                                    className="SN__title"
                                                                    activeClassName="need-to-implement"
                                                                >
                                                                    {project.title}
                                                                </Link>
                                                                <button onClick={() => {this.deleteProject(projectIndex)}}>Del</button>
                                                            </span>
                                                        </li>
                                                    )
                                                })
                                            }
                                        </ul>
                                    </div>
                                </div>
                                <div className="SN__container">
                                    <p className="SN__menu-title">Create New Project</p>
                                    <div className="SN__widget">
                                        <label>Title</label>
                                        <input name="title" value={this.state.newProjectTitle} onChange={this.handleProjectTitleChange}/>
                                        <button className="Section__toolBarButton" onClick={this.createProject}>Create</button>
                                    </div>
                                </div>

                            </div>

                            <div className="SN-Footer__widget">

                            </div>
                        </div>



                        {/* This is the main content area */}
                        <div className='App__grid--main'>
                            <Route exact path="/" render={(props) => <HomePage {
                                ...props} 
                                sections={this.state.sections} 
                                updateComponentState={this.updateComponentState} 
                                updateSectionState={this.updateSectionState}
                            />} />

                            <Route path="/projects/:id" render={(props) => (
                                props.location.state ? (
                                    <ProjectPage {...props}/>
                                ) : (
                                    <Redirect to="/"/>
                                )
                            )} />
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

<button onClick={this.toggleEdit}>{this.state.globalContextObj.editable ? 'Disable Editing' : 'Enable Editing'}</button>


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
*/