import React from 'react'

import PageToolbarPortal from '../rich-text/PageToolbarPortal'
import Section from './Section'
import ClassSelector from '../css-manager/ClassSelector'
import { GlobalContext } from '../../contexts/GlobalContext'  

import { Page as PageObj, Section as SectionObj, GridSection as GridSectionObj, Template, TemplateType, ComponentState } from '../../../types/platform_types';
import { Id } from '../../../types/basic-types';
import { IGlobalContext } from '../../App'

export type PageProps = {
    pageIndex: number;
    page: PageObj;
    id: Id;
    templates: Template<PageObj | SectionObj | ComponentState>[];
    applyPageStyles: (pageIndex: number) => void;
    updatePageState: (pageUpdate: Partial<PageObj>, pageIndex: number) => void;
    setPageStateFromTemplate: (template: Template<PageObj>) => void;
    createTemplate: (type: TemplateType, templateTitle: string) => void;
    addSection: (section: Template<SectionObj>) => void;
    deleteTemplate: (templateIndex: number) => void;

    updateGridSectionState: (gridSectionUpdate: Partial<GridSectionObj>, sectionInFocusIndex: number, gridSectionInFocusIndex: number) => void;
    applyGridSectionStyles: (sectionInFocusIndex: number, gridSectionInFocusIndex: number) => void;
    updateSectionState: (sectionUpdate: Partial<GridSectionObj>, gridSectionInFocusIndex: number) => void;
    applySectionStyles: (sectionInFocusIndex: number) => void;
    addComponent: (type: string, template: Template<ComponentState>) => void;
    updateComponentState: (componentUpdate: Partial<ComponentState>, sectionIndex: number, gridSectionIndex: number, componentStateIndex: number) => void;
    applyComponentStyles: (sectionIndex: number, gridSectionIndex: number, componentStateIndex: number) => void;
    updateSectionLayout: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export type PageState = {
    pageTemplateTitle: string;
    sectionTemplateTitle: string;
}
  
class Page extends React.Component<PageProps, PageState> {
    static contextType: React.Context<IGlobalContext> = GlobalContext;
    context!: React.ContextType<typeof GlobalContext>

    constructor(props: PageProps) {
        super(props)

        this.state = {
            pageTemplateTitle: "",
            sectionTemplateTitle: "", 
        }

        this.handleInputChange = this.handleInputChange.bind(this)
        this.updatePageJsonStyle = this.updatePageJsonStyle.bind(this)
        this.applyPageStyles = this.applyPageStyles.bind(this)
        
        this.updateSelectedClasses = this.updateSelectedClasses.bind(this)
    }


    handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const name = event.target.name as keyof PageState;
        this.setState({
            [name]: event.target.value
        } as PageState);
    }


    updatePageJsonStyle(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const name = event.target.name
        const value = event.target.value

        const pageUpdate = {
            [name]: value,
        } as Partial<PageObj>;

        this.props.updatePageState(pageUpdate, this.props.pageIndex)
    }

    applyPageStyles() {
        this.props.applyPageStyles(this.props.pageIndex)
    }

    updateSelectedClasses(selectedClasses: string) {
        const pageUpdate = {
            className: selectedClasses,
        } as Partial<PageObj>;
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
                        <p className="SN__menu-title">PAGE STYLES</p>
                        <div className='SN__widget'> {/* Section__toolbarMenu */}
                            <textarea 
                                className={"SN__input-textarea"} 
                                placeholder="Styles in JSON format"
                                name="styleInput"
                                value={this.props.page.styleInput}
                                onChange={this.updatePageJsonStyle} // OBS
                            >

                            </textarea>
                            <button className="SN__button-normal SN__button--create" onClick={this.applyPageStyles}>Apply Styles</button>


                        </div>
                    </div>

                    <ClassSelector heading="PAGE CLASSES" cssDocument={this.context.cssDocument} scope="page" updateSelectedClasses={this.updateSelectedClasses} activeClasses={this.props.page.className} />
                    
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
                                                        onClick={() => this.props.setPageStateFromTemplate(template as Template<PageObj>)} 
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
                                        return undefined;
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
                                                        onClick={() => this.props.addSection(template as Template<SectionObj>)} 
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
                                        return undefined;
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
                            id={section.id}
                            sectionIndex={index}
                            section={section}
                            templates={this.props.templates}
                            
                            updateGridSectionState={this.props.updateGridSectionState}
                            applyGridSectionStyles={this.props.applyGridSectionStyles}
                            updateSectionState={this.props.updateSectionState}
                            applySectionStyles={this.props.applySectionStyles}
                            addComponent={this.props.addComponent}
                            createTemplate={this.props.createTemplate}
                            deleteTemplate={this.props.deleteTemplate}
                            updateComponentState={this.props.updateComponentState} 
                            applyComponentStyles={this.props.applyComponentStyles}
                            updateSectionLayout={this.props.updateSectionLayout}
                        />
                    )
                })
            }
            </div>
        )
    }
}

export default Page
