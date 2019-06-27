import React from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";  

import {Login, Register} from './auth'
import ProjectPage from './ProjectPage'

// theme context
// logged in user context
// have different themes based on time of day

  
export default class HomePage extends React.Component {
    constructor(props) {
        super(props)
        
    }
    // This page allows one to create a new project page and manage the home page
    // The ProjectPage contains the functionality to both update and show the project's page.
    // This page requires the user to be authenticated 
    // This page has a logout button 

    /*
    Has the ability to edit itself
    Banner
        image <-- Editable
        name <-- Editable 
        sub-heading <-- Editable
    About/Intro
        intro <-- Editable
        sections <-- Editable, can have multiple, use flexbox to make them look nice 
        
    Portfolio
        list of projects <-- use flexbox, you can add new, and remove old ones, card design 
        card with plus sign on to add new project <-- creates a new project page and redirects
    cv
        You can upload a new cv
    contact
        you can update contact info 
    */

    
    render() {
        return (
            <div>
                <Login></Login>
                <Register></Register>
                
            </div>
        )
    }
}