
import React from 'react';
import * as _ from 'lodash'

import { GlobalContext } from '../../contexts/GlobalContext';
import PageToolbarPortal from '../rich-text/PageToolbarPortal'
import ClassSelector from '../css-manager/ClassSelector';
import { gridLayouts } from './grid'
import RichText from '../rich-text/RichText'

class Section extends React.Component {
    constructor(props) {
        super(props)
        this.sectionRef = React.createRef()
        // this.columnRef = React.createRef()

        this.state = {
            componentTemplateTitle: "",

            gridLayouts: gridLayouts,
        }
        
        this.handleInputChange = this.handleInputChange.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.gridSectionOnFocus = this.gridSectionOnFocus.bind(this)

        this.handleGridSectionInputChange = this.handleGridSectionInputChange.bind(this)
        this.applyGridSectionStyles = this.applyGridSectionStyles.bind(this)
        this.handleSectionInputChange = this.handleSectionInputChange.bind(this)
        this.applySectionStyles = this.applySectionStyles.bind(this)

        this.updateSelectedSectionClasses = this.updateSelectedSectionClasses.bind(this);
        this.updateSelectedGridSectionClasses = this.updateSelectedGridSectionClasses.bind(this);

        // this.updateDimensions = this.updateDimensions.bind(this)
        // this.onBlur = this.onBlur.bind(this)
    }

    handleInputChange(e) {
        const value = e.target.value
        const name = e.target.name
        this.setState({
            [name]: value,
        })
    } 


    onFocus (e) { 
        // e.stopPropagation()
        // console.log('section on focus props: ', this.props.id, this.props.sectionIndex)
        this.context.updateSectionInFocus(this.props.id, this.props.sectionIndex)
    }

    gridSectionOnFocus(gridSectionId, gridSectionIndex) {
        this.context.updateGridSectionInFocus(gridSectionId, gridSectionIndex)
    }
    /*
    onBlur() { 
        console.log("section on blur: ", this.sectionsInFocus, this.props.id)
        if (this.context.sectionInFocus === this.props.id) {
            this.context.updateSectionInFocus('')
        }
    }
    */

    handleGridSectionInputChange(e) {
        const value = e.target.value
        const name = e.target.name

        const gridSectionUpdate = {
            [name]: value,
        }

        this.props.updateGridSectionState(gridSectionUpdate, this.context.sectionInFocusIndex, this.context.gridSectionInFocusIndex)
    }
 

    applyGridSectionStyles(e) {
        this.props.applyGridSectionStyles(this.context.sectionInFocusIndex, this.context.gridSectionInFocusIndex)
    }



    handleSectionInputChange(e) {
        const name = e.target.name
        const value = e.target.value
        const sectionUpdate = {
            [name]: value,
        }

        this.props.updateSectionState(sectionUpdate, this.context.sectionInFocusIndex)
    }

    applySectionStyles(e) {
        this.props.applySectionStyles(this.context.sectionInFocusIndex)
    }

    updateSelectedSectionClasses(classes) {
        const sectionUpdate = {
            className: classes,
        }
        this.props.updateSectionState(sectionUpdate, this.context.sectionInFocusIndex);
    }

    updateSelectedGridSectionClasses(classes) {
        const gridSectionUpdate = {
            className: classes,
        }
        this.props.updateGridSectionState(gridSectionUpdate, this.context.sectionInFocusIndex, this.context.gridSectionInFocusIndex);
    }

    componentDidMount() {
        // this.updateDimensions();
        // window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    componentWillUnmount() {
        // window.removeEventListener("resize", this.updateDimensions.bind(this)); // Dont think this works
    }

    componentDidUpdate(prevProps) {
        if ((prevProps.enableSpacing !== this.props.enableSpacing) || 
            (prevProps.selectedLayout !== this.props.selectedLayout)
        ) {
            // this.updateDimensions()
        }
    }

    contextChanged() {
        return false
    }


    render() {
        // things are either an input or a span
        return (
            <div 
                style={{
                    'border': this.context.enableSpacing ? ((this.context.sectionInFocus === this.props.id) ? '1px solid red' : '1px dashed grey') : 'none', // add this to Section__container and have border-box sort out width calculations?
                }}
            
            >
                <div 
                    className={`Section__container ${this.props.section.className}  ${this.context.enableSpacing ? "spacing" : ""}`} 
                    ref={this.sectionRef} 
                    onClick={this.onFocus} 
                    style={{
                        ...this.props.section.style,
                    }}
                    >

                    { (this.context.sectionInFocus === this.props.id) && 
                         <PageToolbarPortal>

                            { !this.context.gridSectionInFocus && 
                                <React.Fragment>
                                    <div className="SN__container">
                                        <p className="SN__menu-title">SECTION CONFIG</p>
                                        <div className='SN__widget'> {/* Section__toolbarMenu */}
                                            <select className="Section__toolbar-select" value={this.props.section.selectedLayout} onChange={this.props.updateSectionLayout}>
                                                {
                                                    Object.keys(this.state.gridLayouts).map(sectionLayoutKey => {
                                                        return (
                                                            <option 
                                                            key={this.state.gridLayouts[sectionLayoutKey].layoutName} 
                                                            value={this.state.gridLayouts[sectionLayoutKey].layoutName}
                                                            >
                                                                    {this.state.gridLayouts[sectionLayoutKey].layoutName}
                                                            </option>
                                                            )
                                                        })
                                                    }
                                            </select>

                                            <textarea 
                                                className={"SN__input-textarea"} 
                                                placeholder="Styles in JSON format"
                                                name="styleInput"
                                                value={this.props.section.styleInput}
                                                onChange={this.handleSectionInputChange} // OBS
                                            >

                                            </textarea>
                                            <button className="SN__button-normal SN__button--create" onClick={this.applySectionStyles}>Apply Styles</button>
                                        </div>
                                    </div>
                                    <ClassSelector heading="SECTION CLASSES" cssDocument={this.context.cssDocument} scope="section" updateSelectedClasses={this.updateSelectedSectionClasses} activeClasses={this.props.section.className} />
                                </React.Fragment>
                            }

                            <div className="SN__container">
                                <p className="SN__menu-title">COMPONENT TEMPLATES</p>
                                <div className='SN__widget'> {/* Section__toolbarMenu */}
                                    <ul>
                                        {
                                            this.props.templates.map((template, templateIndex) => {
                                                if (template.type === "component") {
                                                    return (
                                                        <li>
                                                            <a 
                                                                className="SN__item" 
                                                                onClick={() => this.props.addComponent("template", template)} 
                                                                title={`Add ${template.title} as a component to the section.`}
                                                            >
                                                                <i className="material-icons">note_add</i><span>{template.title}</span>
                                                                <button className="SN__button SN__delete-button" onClick={(e) => {e.stopPropagation(); this.props.deleteTemplate(templateIndex); }}>
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
                                            name="componentTemplateTitle"
                                            value={this.state.componentTemplateTitle} 
                                            onChange={this.handleInputChange}
                                        />
                                        <button className="SN__button SN__add-button" onClick={() => this.props.createTemplate("component", this.state.componentTemplateTitle)}>
                                            <i className="material-icons">add_box</i>
                                        </button>
                                    </div>
                                
                                </div>
                            </div>
                        </PageToolbarPortal>
                    }
                    

                    {this.props.section.gridSections.map((gridSection, i) => {
                        return (
                            <div
                                style={{
                                    'border': this.context.enableSpacing ? ((this.context.gridSectionInFocus === gridSection.id) ? '1px solid blue' : '1px dashed grey') : 'none',
                                }} 
                            >
                            
                                <div 
                                className={`GridSection ${gridSection.className} ${this.context.enableSpacing ? "spacing" : ""}`}
                                style={gridSection.style} // hold grid styles, I need to solve this...
                                key={gridSection.id}
                                onClick={(e) => { this.gridSectionOnFocus(gridSection.id, i); }}
                                > {/* gridSection.style['width'] */}

                                {/* Grid Section Toolbar (very similar to section toolbar */}
                                { (!this.context.componentInFocus && (this.context.gridSectionInFocus === gridSection.id)) && 
                                    // Section Toolbar side
                                    // PageToolbarPortal is used multiple places and the order of the content cannot be controlled
                                    <PageToolbarPortal>
                                        <div className="SN__container">
                                            <p className="SN__menu-title">GRID SECTION CONFIG</p>
                                            <div className='SN__widget'> {/* Section__toolbarMenu */}
                                                <textarea 
                                                    className={"SN__input-textarea"} 
                                                    placeholder="Styles in JSON format"
                                                    name="styleInput"
                                                    value={gridSection.styleInput}
                                                    onChange={this.handleGridSectionInputChange} // OBS
                                                >

                                                </textarea>
                                                <button className="SN__button-normal SN__button--create" onClick={this.applyGridSectionStyles}>Apply Styles</button>
                                            </div>
                                        </div>
                                        
                                        <ClassSelector heading="GRID SECTION CLASSES" cssDocument={this.context.cssDocument} scope="gridSection" updateSelectedClasses={this.updateSelectedGridSectionClasses} activeClasses={gridSection.className} />
                                    </PageToolbarPortal>
                                }
                                
                                {gridSection.componentStates.map((componentState, j) => {
                                    // Need to accomedate for different component types here
                                    return (<RichText 
                                        key={componentState.id}
                                        sectionId={this.props.id}
                                        id={componentState.id}

                                        deleteObject={this.props.deleteObjects}
                                        
                                        sectionIndex={this.props.sectionIndex}
                                        gridSectionIndex={i}
                                        componentStateIndex={j}
                                        
                                        componentState={componentState} 
                                        updateComponentState={this.props.updateComponentState} // need to wrap this and make it called onChange
                                        applyComponentStyles={this.props.applyComponentStyles}
                                        />)
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

Section.contextType = GlobalContext

export default Section
