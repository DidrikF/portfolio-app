import React from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import { Login, Register } from './auth'
import ProjectPage from './ProjectPage'
import HomePage from './HomePage'

// theme context
// logged in user context
// have different themes based on time of day


export default class App extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            projectTitle: '', 
            projects: []
        }

        this.changeProjectTitle = this.changeProjectTitle.bind(this)
        this.newProjectPage = this.newProjectPage.bind(this)
        this.updateNavigation = this.updateNavigation.bind(this)
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
        return (
            <Router>
                <div>
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

                    <input value={this.state.projectTitle} onChange={this.changeProjectTitle}></input>
                    <button onClick={this.newProjectPage}>New Project Page</button>

                    <Route exact path="/" component={HomePage} />
                    <Route path="/projects/:id" render={(props) => <ProjectPage {...props} updateNavigation={this.updateNavigation} />} />

                </div>
            </Router>
        )
    }
}


