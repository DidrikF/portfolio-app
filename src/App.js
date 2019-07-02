import React from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Route, Link } from "react-router-dom"; 
import ContentEditable from 'react-contenteditable' // use for inputs that does not require rich text editing. This allows inputs to have the same style 
// as the elements in "view mode". This does not support undo/redo
// Use quill for creating artichles // would be really nice to embed the tool bar into the editor bar...



import { Login, Register } from './auth'
import ProjectPage from './ProjectPage'
import HomePage from './HomePage'
import { GlobalContext } from './contexts'
// theme context
// logged in user context
// have different themes based on time of day


class App extends React.Component {
    constructor(props) {
        super(props)

        this.toggleEdit = this.toggleEdit.bind(this)
        this.changeProjectTitle = this.changeProjectTitle.bind(this)
        this.newProjectPage = this.newProjectPage.bind(this)
        this.updateNavigation = this.updateNavigation.bind(this)


        this.state = {
            projectTitle: '', 
            projects: [],
            globalContextObj: {
                pathPrefix: '',
                editable: true,
                toggleEdit: this.toggleEdit
            }
        }
    } 
    
    toggleEdit() {
        this.setState((state, props) => {
            let globalContextObj = state.globalContextObj
            globalContextObj.editable = globalContextObj.editable ? false : true
            return {
                globalContextObj: globalContextObj
            }
        })
    }
    

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

    changeProjectTitle(e) {
        this.setState({
            projectTitle: e.target.value
        })
    }

    
    updateNavigation() {
        this.loadProjects()
    }

    newProjectPage() {
        axios.post('/projects', {
            title: this.state.projectTitle
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

    componentDidMount() {
        this.loadProjects()
    }

    render() {
        // render one layout for editor mode, and another layout for view mode
        return (
            <GlobalContext.Provider value={this.state.globalContextObj}>
                <Router>
                        <div>
                            <div className="EditorPanel">
                                <h3>Editor panel</h3>
                                <ul>
                                    <li>
                                        <Link to="/">Home</Link>
                                    </li>
                                    {
                                        this.state.projects.map(project => (
                                            <li key={project._id}><Link to={'/projects/'+project._id}>{project.title}</Link></li>
                                        ))
                                    }
                                </ul> 
                                
                                <button onClick={this.toggleEdit}>{this.state.globalContextObj.editable ? 'Disable Editing' : 'Enable Editing'}</button>                            
                                
                                {/* Quill toolbar here  */}
                                <div id='RichText__toolbar' />

                                
                                <label>Make new Project</label>
                                <input value={this.state.projectTitle} onChange={this.changeProjectTitle}></input>
                                <button onClick={this.newProjectPage}>New Project Page</button>
                                
                                
                            </div>
                            <Route exact path="/" component={HomePage} />
                            <Route path="/projects/:id" render={(props) => <ProjectPage {...props} updateNavigation={this.updateNavigation} />} />
                                
                        </div>
                    
                </Router>
            </GlobalContext.Provider>
            
        )
    }
}


App.contextType = GlobalContext

export default App

// render={(props) => <ProjectPage {...props} updateNavigation={this.updateNavigation} />}