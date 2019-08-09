import React from 'react'
import axios from 'axios'

import { SketchPicker } from 'react-color'

import PageToolbarPortal from './helper-components/PageToolbarPortal'
import Section from './Section'
import { GlobalContext } from './contexts'  

  
class Page extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            height: 0,
        }

        this.handleChange = this.handleChange.bind(this)
        this.handlePageInputChange = this.handlePageInputChange.bind(this)
        this.applyPageStyles = this.applyPageStyles.bind(this)
    }


    handleChange(e) {
        const name = e.target.name
        this.setState({
            [name]: e.target.value
        })
    }


    handlePageInputChange(e) {
        const name = e.target.name
        const value = e.target.value

        const pageUpdate = {
            [name]: value,
        }

        this.props.updatePageState(pageUpdate, this.props.pageIndex)
    }

    applyPageStyles() {
        this.props.applyPageStyles(this.props.pageIndex)
    }

    componentDidMount() {

        const setPageHeight = () => {
            this.setState({
                pageHeight: document.documentElement.clientHeight
            })
        }

        setPageHeight()
        window.addEventListener("resize", setPageHeight) // may not be sufficent (full screen etc.)

    }
    
    render() {
        return (
            <div 
                className={"Page " + this.props.page.className} 
                id={this.props.id}
                style={{
                    ...this.props.page.style,
                    minHeight: this.state.pageHeight
                }}
            >
            
            { this.context.editing && (!this.context.sectionInFocus) && 
                <PageToolbarPortal>
                    <div className="SN__container">
                        <p className="SN__menu-title">PAGE CONFIG</p>
                        <div className='SN__widget'> {/* Section__toolbarMenu */}
                            <textarea 
                                className={"SN__input-textarea"} 
                                placeholder="Styles in JSON format"
                                name="styleInput"
                                value={this.props.page.styleInput}
                                onChange={this.handlePageInputChange} // OBS
                            >

                            </textarea>
                            <button className="SN__button-normal SN__button--create" onClick={this.applyPageStyles}>Apply Styles</button>
                        </div>
                    </div>
                </PageToolbarPortal>
            }

            {
                this.props.page.sections.map((section, index) => {
                    return (
                        <Section 
                            key={section.id} 
                            sectionIndex={index}
                            
                            id={section.id}
                            section={section}
                            enableSpacing={this.props.enableSpacing}
                            selectedLayout={section.selectedLayout} // could represent a banner too i guess...
                            
                            //style={section.style}
                            //gridSections={section.gridSections}

                            containerRef={this.props.containerRef}


                            updateSectionState={this.props.updateSectionState}
                            applySectionStyles={this.props.applySectionStyles}
                            updateSectionLayout={this.props.updateSectionLayout}
                            updateGridSectionState={this.props.updateGridSectionState}
                            updateSectionWidths={this.props.updateSectionWidths}
                            applyGridSectionStyles={this.props.applyGridSectionStyles}
                            updateComponentState={this.props.updateComponentState} // to be used inside Section
                            applyComponentStyles={this.props.applyComponentStyles}

                            moveObject={this.props.moveObject}
                            deleteObject={this.props.deleteObject}
                        />
                    )
                })
            }
            </div>
        )
    }
}
Page.contextType = GlobalContext;

export default Page

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




         <ul>
            <li><a className="SN__item" onClick={this.toggleColorPicker}>
                <i className="material-icons">add_box</i>
                <span>Background Color</span>
                <button className="SN__color-button" style={{background: this.state.colorPickerColor}}></button>
            </a></li>
        </ul>
        <div className="SN__input-container"> 
            <input 
                className="SN__input" 
                placeholder="Border"  
                value={this.state.border} 
                name="border" 
                onChange={this.handleChange}
                onKeyDown={this.applyStyles}
            />
        </div>
        <div className="SN__input-container">
            <input 
                className="SN__input" 
                placeholder="Padding" 
                value={this.state.padding} 
                name="padding" 
                onChange={this.handleChange} 
                onKeyDown={this.applyStyles}
            />
        </div>
        <div className="SN__input-container">
            <input 
                className="SN__input" 
                placeholder="Margin" 
                value={this.state.margin} 
                name="margin" 
                onChange={this.handleChange} 
                onKeyDown={this.applyStyles}
            />

        </div>


        {this.state.showColorPicker &&
            <SketchPicker
                className="Page-color-pallet"
                color={this.state.colorPickerState}
                onChangeComplete={this.handleColorChange}
            />
        }
*/
