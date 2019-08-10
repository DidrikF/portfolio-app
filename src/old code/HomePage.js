import React from 'react'
import axios from 'axios'
import { BrowserRouter as Router, Route, Link } from "react-router-dom";  

import {Login, Register} from './helper-components/auth'
import ProjectPage from './ProjectPage'
import Section from './Section'

import { GlobalContext } from './contexts'  
import { getId } from './helpers'


// theme context
// logged in user context
// have different themes based on time of day
 

// is this component the owner of Project Card States?
// I need a way to connect a project card with a project page...

// This is to be built with the app! This is just for testing and development.
  
class HomePage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }
    }
    
    render() {
        return (
                <div>
                    <a name="home"></a>
                    <div className="Banner">
                        <div className="Banner__frame">
                            <img className="Banner__profilepicture" src={this.context.pathPrefix + "/images/profile_picture.png"} alt="banner portrait"/>
                        </div>

                        <div className="Banner__text">
                            <h1 className="Banner__heading">DIDRIK FLEISCHER</h1>
                            <p className="Banner__subheading">MSc in industrial economics and<br/>junior web developer</p>
                        </div>


                        <nav className="Banner__navigation">
                            <ul className="Navigation__list">
                                <li className="Navigation__element"><a href="#home">HOME</a></li>
                                <li className="Navigation__element"><a href="#about">ABOUT</a></li>
                                <li className="Navigation__element"><a href="#portfolio">PORTFOLIO</a></li>
                                <li className="Navigation__element"><a href="#cv">CV</a></li>
                                <li className="Navigation__element"><a href="#contact">CONTACT</a></li>
                            </ul>
                        </nav>
                    </div>


                    <div className="Sections">
                    {
                        this.props.sections.map((section, index) => {
                            return (
                                <Section 
                                    key={section.id} 
                                    sectionIndex={index}

                                    id={section.id}
                                    style={section.style}
                                    selectedLayout={section.selectedLayout} // could represent a banner too i guess...
                                    gridSections={section.gridSections}
                                    containerRef={this.props.containerRef}

                                    updateComponentState={this.props.updateComponentState} // to be used inside Section
                                    updateSectionState={this.props.updateSectionState}
                                />
                            )
                        })
                    }
                    </div>

                    

                    
                </div>
            )
    }
}
HomePage.contextType = GlobalContext;

export default HomePage

/*
// Section Spedific:
background
selectedLayout
id
gridSections

// Common for all components:
updateComponentState
deleteComponent

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

        <About />
        <Resume />
        <div className="Portfolio">
            <a name="portfolio"></a>
            <h2 className="Section__title">Portfolio</h2>
            <div className="Portfolio__container">
                {
                    this.state.cards.map(card => {
                        return (<ProjectCard card={card} />)
                    })
                }
            </div>
        </div>
        <Contact />
        
        <Footer />
*/
