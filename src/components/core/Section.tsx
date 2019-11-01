
import React from 'react';
import * as _ from 'lodash'

import { GlobalContext } from '../../contexts/GlobalContext';
import PageToolbarPortal from '../rich-text/PageToolbarPortal'
import ClassSelector from '../css-manager/ClassSelector';
import { gridLayouts } from './grid'
import RichText from '../rich-text/RichText'
import { IGlobalContext } from '../../App';
import { Id } from '../../../types/basic-types';
import { Page as PageObj, GridSection as GridSectionObj, Section as SectionObj, ComponentState, Template, TemplateType } from '../../../types/platform_types';

export type SectionProps = {
    id: Id;
    sectionIndex: number;
    section: SectionObj;
    templates: Template<PageObj | SectionObj | ComponentState>[];
    updateGridSectionState: (gridSectionUpdate: Partial<GridSectionObj>, sectionInFocusIndex: number, gridSectionInFocusIndex: number) => void;
    applyGridSectionStyles: (sectionInFocusIndex: number, gridSectionInFocusIndex: number) => void;
    updateSectionState: (sectionUpdate: Partial<GridSectionObj>, gridSectionInFocusIndex: number) => void;
    applySectionStyles: (sectionInFocusIndex: number) => void;
    addComponent: (type: string, template: Template<ComponentState>) => void;
    createTemplate: (type: TemplateType, templateTitle: string) => void;
    deleteTemplate: (templateIndex: number) => void;    
    updateComponentState: (componentUpdate: Partial<ComponentState>, sectionIndex: number, gridSectionIndex: number, componentStateIndex: number) => void;
    applyComponentStyles: (sectionIndex: number, gridSectionIndex: number, componentStateIndex: number) => void;
    updateSectionLayout: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export type SectionState = {
    componentTemplateTitle: string;
    gridLayouts: any; // not sure... want a way to define my own grids.
}

class Section extends React.Component<SectionProps, SectionState> {
    static contextType: React.Context<IGlobalContext> = GlobalContext;
    context!: React.ContextType<typeof GlobalContext>

    sectionRef: React.Ref<HTMLDivElement>;

    constructor(props: SectionProps) {
        super(props)
        this.sectionRef = React.createRef()

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

    handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const name = event.target.name as keyof SectionState;
        const value = event.target.value
        this.setState({
            [name]: value,
        } as SectionState)
    } 


    onFocus (event: React.MouseEvent<HTMLDivElement>) { 
        this.context.updateSectionInFocus(this.props.id, this.props.sectionIndex);
    }

    gridSectionOnFocus(gridSectionId: Id, gridSectionIndex: number) {
        this.context.updateGridSectionInFocus(gridSectionId, gridSectionIndex)
    }

    handleGridSectionInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const name = event.target.name as keyof GridSectionObj;
        const value = event.target.value

        const gridSectionUpdate = {
            [name]: value,
        } as Partial<GridSectionObj>

        this.props.updateGridSectionState(gridSectionUpdate, this.context.sectionInFocusIndex, this.context.gridSectionInFocusIndex)
    }
 

    applyGridSectionStyles(event: React.MouseEvent) {
        this.props.applyGridSectionStyles(this.context.sectionInFocusIndex, this.context.gridSectionInFocusIndex)
    }



    handleSectionInputChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const name = event.target.name
        const value = event.target.value
        const sectionUpdate = {
            [name]: value,
        } as Partial<SectionObj>

        this.props.updateSectionState(sectionUpdate, this.context.sectionInFocusIndex)
    }

    applySectionStyles(event: React.MouseEvent) {
        this.props.applySectionStyles(this.context.sectionInFocusIndex)
    }

    updateSelectedSectionClasses(classes: string) {
        const sectionUpdate = {
            className: classes,
        } as Partial<SectionObj>
        this.props.updateSectionState(sectionUpdate, this.context.sectionInFocusIndex);
    }

    updateSelectedGridSectionClasses(classes: string) {
        const gridSectionUpdate = {
            className: classes,
        } as Partial<GridSectionObj>
        this.props.updateGridSectionState(gridSectionUpdate, this.context.sectionInFocusIndex, this.context.gridSectionInFocusIndex);
    }

    componentDidMount() {
        // this.updateDimensions();
        // window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    componentWillUnmount() {
        // window.removeEventListener("resize", this.updateDimensions.bind(this)); // Dont think this works
    }

    componentDidUpdate(prevProps: SectionProps) {
        /*
        if ((prevProps.enableSpacing !== this.props.enableSpacing) || 
            (prevProps.selectedLayout !== this.props.selectedLayout)
        ) {
            // this.updateDimensions()
            // Change grid logic?
        }
        */
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
                                                                onClick={() => this.props.addComponent("template", template as Template<ComponentState>)} 
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
                                                return undefined;
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
                                >

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
                                    return (<RichText 
                                        key={componentState.id}
                                        id={componentState.id}
                                        componentState={componentState} 
                                        sectionId={this.props.id}
                                        sectionIndex={this.props.sectionIndex}
                                        gridSectionIndex={i}
                                        componentStateIndex={j}
                                        miniToolbarHandlers={undefined}
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

export default Section
