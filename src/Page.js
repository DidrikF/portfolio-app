import React from 'react'
import axios from 'axios'


import PageToolbarPortal from './helper-components/PageToolbarPortal'
import Section from './Section'
import { GlobalContext } from './contexts'  

  
class Page extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            height: 0,

            pageTemplateTitle: "",
            sectionTemplateTitle: "", 
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handlePageInputChange = this.handlePageInputChange.bind(this)
        this.applyPageStyles = this.applyPageStyles.bind(this)
    }


    handleInputChange(e) {
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
                    <div className="SN__container">
                        <p className="SN__menu-title">PAGE TEMPLATES</p>
                        <div className='SN__widget'> {/* Section__toolbarMenu */}
                            <ul>
                                {
                                    this.props.templates.map((template, templateIndex) => {
                                        if (template.type === "page") {
                                            return (
                                                <li>
                                                    <a 
                                                        className="SN__item" 
                                                        onClick={() => this.props.setPageStateFromTemplate(template)} 
                                                        title={`Apply ${template.title} as a template to the current page`}
                                                    >
                                                        <i className="material-icons">note_add</i><span>{template.title}</span>
                                                        <button className="SN__button SN__delete-button" onClick={(e) => { e.stopPropagation(); this.props.deleteTemplate(templateIndex); }}>
                                                            <i className="material-icons">delete</i>
                                                        </button>      
                                                    </a>
                                                                                        
                                                </li>        
                                            )
                                        }
                                    })
                                }
                            </ul>
                            <div>
                                <input 
                                    className="SN__input" 
                                    placeholder="Template Title" 
                                    name="pageTemplateTitle"  
                                    value={this.state.pageTemplateTitle} 
                                    onChange={this.handleInputChange}
                                />
                                <button className="SN__button SN__add-button" onClick={(e) => { this.props.createTemplate("page", this.state.pageTemplateTitle); }}>
                                    <i className="material-icons">add_box</i>
                                </button>
                            </div>
                        
                        </div>
                    </div>
                    <div className="SN__container">
                        <p className="SN__menu-title">SECTION TEMPLATES</p>
                        <div className='SN__widget'> {/* Section__toolbarMenu */}
                            <ul>
                                {
                                    this.props.templates.map((template, templateIndex) => {
                                        if (template.type === "section") {
                                            return (
                                                <li>
                                                    <a 
                                                        className="SN__item" 
                                                        onClick={() => this.props.addSection(template)} 
                                                        title={`Add ${template.title} as a section to the page.`}
                                                    >
                                                        <i className="material-icons">note_add</i><span>{template.title}</span>
                                                        <button className="SN__button SN__delete-button" onClick={(e) => { e.stopPropagation(); this.props.deleteTemplate(templateIndex); }}>
                                                            <i className="material-icons">delete</i>
                                                        </button>                                          
                                                    </a>
                                                </li>        
                                            )
                                        }
                                    })
                                }
                            </ul>
                            <div>
                                <input 
                                    className="SN__input" 
                                    placeholder="Template Title" 
                                    name="sectionTemplateTitle"  
                                    value={this.state.sectionTemplateTitle} 
                                    onChange={this.handleInputChange}
                                />
                                <button className="SN__button SN__add-button" onClick={() => this.props.createTemplate("section", this.state.pageTemplateTitle)}>
                                    <i className="material-icons">add_box</i>
                                </button>
                            </div>
                        
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
                            
                            addComponent={this.props.addComponent}
                            
                            templates={this.props.templates}
                            createTemplate={this.props.createTemplate}
                            deleteTemplate={this.props.deleteTemplate}
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
                onChange={this.handleInputChange}
                onKeyDown={this.applyStyles}
            />
        </div>
        <div className="SN__input-container">
            <input 
                className="SN__input" 
                placeholder="Padding" 
                value={this.state.padding} 
                name="padding" 
                onChange={this.handleInputChange} 
                onKeyDown={this.applyStyles}
            />
        </div>
        <div className="SN__input-container">
            <input 
                className="SN__input" 
                placeholder="Margin" 
                value={this.state.margin} 
                name="margin" 
                onChange={this.handleInputChange} 
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
