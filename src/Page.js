import React from 'react'
import axios from 'axios'
import { SketchPicker } from 'react-color'

import Section from './Section'
import { GlobalContext } from './contexts'  

  
class Page extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            border: "",
            padding: "", 
            margin: "", 
        
            showColorPicker: false,
            colorPickerColor: "",
            colorPickerState: {},

        }

        this.toggleColorPicker = this.toggleColorPicker.bind(this)
        this.handleColorChange = this.handleColorChange.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.applyStyles = this.applyStyles.bind(this)
    }

    toggleColorPicker() {
        this.setState((state, props) => {
            return {
                showColorPicker: !state.showColorPicker
            }
        })
    }

    handleColorChange(color) {
        this.setState({
            colorPickerColor: color.hex,
            colorPickerState: color,
        })

        const update = {
            style: {
                background: color.hex
            }
        }

        this.props.updatePageState(update, this.props.pageIndex)
    }

    handleChange(e) {
        const name = e.target.name
        this.setState({
            [name]: e.target.value
        })
    }

    applyStyles() {
        const pageUpdate = {
            style: {
                border: this.state.border,
                padding: this.state.padding,
                margin: this.state.margin,
            }
        }

        this.props.updatePageState(pageUpdate, this.props.pageIndex)
    }
    
    render() {
        return (
            <div 
                className={"Page " + this.props.page.className} 
                id={this.props.id}
                style={this.props.page.style}
            >
            { this.context.editing &&
                <div className="Page__toolbar">
                    <button className="Section__toolbar-button"><i className="material-icons">insert_photo</i></button>
                    <button className="Section__toolbar-color-button" onClick={this.toggleColorPicker} style={{background: this.state.colorPickerColor}}></button>
                    {this.state.showColorPicker &&
                        <SketchPicker
                            className="Section__toolbar-color-pallet"
                            color={this.state.colorPickerState}
                            onChangeComplete={this.handleColorChange}
                        />
                    }

                    <input 
                        className="Section__toolbar-input" 
                        placeholder="Border" 
                        value={this.state.border} 
                        name="border" 
                        onChange={this.handleChange} 
                        onKeyDown={this.applyStyles}
                    />
                    <input 
                        className="Section__toolbar-input" 
                        placeholder="Padding" 
                        value={this.state.padding} 
                        name="padding" 
                        onChange={this.handleChange} 
                        onKeyDown={this.applyStyles}
                    />
                    <input 
                        className="Section__toolbar-input" 
                        placeholder="Margin" 
                        value={this.state.margin} 
                        name="margin" 
                        onChange={this.handleChange} 
                        onKeyDown={this.applyStyles}
                    />
                </div>

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


                            updateComponentState={this.props.updateComponentState} // to be used inside Section
                            updateSectionState={this.props.updateSectionState}
                            updateSectionLayout={this.props.updateSectionLayout}
                            updateGridSectionState={this.props.updateGridSectionState}
                            updateSectionWidths={this.props.updateSectionWidths}

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
*/
