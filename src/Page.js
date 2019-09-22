import React from 'react'
import axios from 'axios'


import PageToolbarPortal from './helper-components/PageToolbarPortal'
import Section from './Section'
import ClassSelector from './ClassSelector'
import { GlobalContext } from './contexts'  

  
class Page extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            pageTemplateTitle: "",
            sectionTemplateTitle: "", 
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.handlePageInputChange = this.handlePageInputChange.bind(this)
        this.applyPageStyles = this.applyPageStyles.bind(this)
        
        this.updateSelectedClasses = this.updateSelectedClasses.bind(this)
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

    updateSelectedClasses(selectedClasses) {
        const pageUpdate = {
            className: selectedClasses.join(", "),
        };
        this.props.updatePageState(pageUpdate, this.props.pageIndex);
    }
    
    render() {
        return (
            <div 
                className={"Page " + this.props.page.className} 
                id={this.props.id}
                style={{
                    ...this.props.page.style,
                }}
            >
            
            { this.context.editing && 
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

                            <ClassSelector cssDocument={this.context.cssDocument} scope="page" updateSelectedClasses={this.updateSelectedClasses}/>

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
                                <button className="SN__button SN__add-button" onClick={() => this.props.createTemplate("section", this.state.sectionTemplateTitle)}>
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
                            selectedLayout={section.selectedLayout}
                            
                            addComponent={this.props.addComponent}
                            
                            templates={this.props.templates}
                            createTemplate={this.props.createTemplate}
                            deleteTemplate={this.props.deleteTemplate}

                            containerRef={this.props.containerRef}


                            updateSectionState={this.props.updateSectionState}
                            applySectionStyles={this.props.applySectionStyles}
                            updateSectionLayout={this.props.updateSectionLayout}
                            updateGridSectionState={this.props.updateGridSectionState}
                            updateSectionWidths={this.props.updateSectionWidths}
                            applyGridSectionStyles={this.props.applyGridSectionStyles}

                            moveObject={this.props.moveObject} // #OBS remove i think
                            deleteObject={this.props.deleteObject} // #OBS remove i think
                            
                            updateComponentState={this.props.updateComponentState} 
                            applyComponentStyles={this.props.applyComponentStyles}
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
