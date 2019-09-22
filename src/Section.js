
import React from 'react';
import { GlobalContext } from './contexts';
import RichText from './content-components/RichText'
import PageToolbarPortal from './helper-components/PageToolbarPortal'
import * as _ from 'lodash'
import 'react-quill/dist/quill.snow.css';
import { gridLayouts } from './grid'
import { thisExpression } from '@babel/types';

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
                                className={"GridSection "  + (this.context.enableSpacing ? "spacing" : "")}
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


/*

Section Toolbar 
Should be on the section 
<button className="Section__toolbarButton" onClick={this.props.updateSectionLayout} name='oneColumn'>1 Column</button>
<button className="Section__toolbarButton" onClick={this.props.updateSectionLayout} name='twoColumns'>2 Column</button>
<button className="Section__toolbarButton" onClick={this.props.updateSectionLayout} name='threeColumns'>3 Column</button>
<i className="fas fa-palette Section__toolbarButton" onClick={this.toggleColorPicker}/>
<div className='Section__toolbarWidgets'>
    {this.state.showColorPicker &&
        <SketchPicker
            color={this.state.colorPickerColor}
            onChangeComplete={this.handleColorChange}
        />
    }
</div>


key={section.id} 
sectionIndex={index}

id={section.id}
background={section.background}
selectedLayout={section.selectedLayout} // could represent a banner too i guess...
gridSections={section.gridSections}

updateComponentState={this.props.updateComponentState} // to be used inside Section
updateSectionState={this.props.updateSectionState}

toolbar={(<ReactQuill.Toolbar
id='Section__quillToolbar'
theme='snow'
items={[

    { label:'Formats', type:'group', items: [
        { label:'Font', type:'font', items: [
            { label:'Sans Serif',  value:'sans-serif', selected:true },
            { label:'Serif',       value:'serif' },
            { label:'Monospace',   value:'monospace' }
        ]},
        { label:'Size', type:'size', items: [
            { label:'Small',  value:'10px' },
            { label:'Normal', value:'13px', selected:true },
            { label:'Large',  value:'18px' },
            { label:'Huge',   value:'32px' }
        ]},
        { label:'Alignment', type:'align', items: [
            { label:'', value:'', selected:true },
            { label:'', value:'center' },
            { label:'', value:'right' },
            { label:'', value:'justify' }
        ]}
    ]},             
    { label:'Blocks', type:'group', items: [
        { type:'list', value:'bullet' },
        { type:'list', value:'ordered' }
    ]},

    { label:'Blocks', type:'group', items: [
        { type:'image', label:'Image' }
    ]}

]}
/>)}




    handleSectionInputChange(e) {
        const name = e.target.name
        const value = e.target.value
        this.setState({
            [name]: value
        })
    }

    applySectionStyles(e) {
        if (e.key !== "Enter") return
        const sectionUpdate = {
            style: {
                border: this.state.border,
                padding: this.state.padding,
                margin: this.state.margin,
                // background: this.state.background
            }
        }
        this.props.updateSectionState(sectionUpdate, this.context.sectionInFocusIndex)
    }




<div className="Section__toolbar Section__toolbar--large">
    <select className="Section__toolbar-select" value={this.props.section.selectedLayout} onChange={this.props.updateSectionLayout}>
        {
            Object.keys(this.state.gridLayouts).map(gridLayoutName => {
                return (
                    <option key={gridLayoutName} value={gridLayoutName}>{gridLayoutName}</option>
                    )
                })
            }
    </select>
    <button className="Section__toolbar-button" onClick={() => { this.props.moveObject(-1) }}><i className="material-icons">arrow_drop_up</i></button>
    <button className="Section__toolbar-button" onClick={() => { this.props.moveObject(1) }}><i className="material-icons">arrow_drop_down</i></button>

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
        onChange={this.handleSectionInputChange} 
        onKeyDown={this.applySectionStyles}
        />
    <input 
        className="Section__toolbar-input" 
        placeholder="Padding"
        value={this.state.padding} 
        name="padding" 
        onChange={this.handleSectionInputChange} 
        onKeyDown={this.applySectionStyles}
        />
    <input 
        className="Section__toolbar-input" 
        placeholder="Margin"
        value={this.state.margin} 
        name="margin" 
        onChange={this.handleSectionInputChange} 
        onKeyDown={this.applySectionStyles}
        />
    <button className="Section__toolbar-button" onClick={this.updateDimensions}><i className="material-icons">border_all</i></button>
    <button className="Section__toolbar-button" onClick={this.props.deleteObject}><i className="material-icons">delete</i></button>
</div>


















handleGridSectionInputChange(e) {
        const name = e.target.name
        const value = e.target.value
        this.setState((state, props) => {
            
            state.gridSection[name] = value
            return {
                gridSection: state.gridSection,
            }
        })
    }


    applyGridSectionStyles (e) {
        if (e.key !== "Enter") return
        const gridSectionUpdate = {
            style: {
                border: this.state.gridSection.border,
                padding: this.state.gridSection.padding,
                margin: this.state.gridSection.margin,
            }
        }

        this.props.updateGridSectionState(gridSectionUpdate, this.context.sectionInFocusIndex, this.context.gridSectionInFocusIndex)
    }


<ul>
    <li><a className="SN__item" onClick={this.toggleColorPicker}>
        <i className="material-icons">add_box</i>
        <span>Background Color</span>
        <button className="SN__color-button" style={{background: this.state.colorPickerColor}}></button>
    </a></li>
</ul>
<div className="Section__toolbar Section__toolbar--small">
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
        value={this.state.gridSection.border} 
        name="border" 
        onChange={this.handleGridSectionInputChange} 
        onKeyDown={this.applyGridSectionStyles}
        />
    <input 
        className="Section__toolbar-input" 
        placeholder="Padding" 
        value={this.state.gridSection.padding} 
        name="padding" 
        onChange={this.handleGridSectionInputChange} 
        onKeyDown={this.applyGridSectionStyles}
        />
    <input 
        className="Section__toolbar-input" 
        placeholder="Margin" 
        value={this.state.gridSection.margin} 
        name="margin" 
        onChange={this.handleGridSectionInputChange} 
        onKeyDown={this.applyGridSectionStyles}
        />
    <button className="Section__toolbar-button" onClick={this.props.deleteObject}><i className="material-icons">delete</i></button>
</div>

{this.state.showColorPicker &&
    <SketchPicker
        className="Page-color-pallet"
        color={this.state.colorPickerState}
        onChangeComplete={this.handleColorChange}
    />
}

*/



    // May be able to get around this...
    /*
    updateDimensions() {
        const containerElement = document.getElementsByClassName('Page')[0]
        const sectionPaddingRight = window.getComputedStyle(this.sectionRef.current, null).getPropertyValue('padding-right')
        const sectionPaddingLeft = window.getComputedStyle(this.sectionRef.current, null).getPropertyValue('padding-left')
        const sectionMarginRight = window.getComputedStyle(this.sectionRef.current, null).getPropertyValue('margin-right')
        const sectionMarginLeft = window.getComputedStyle(this.sectionRef.current, null).getPropertyValue('margin-right')
        const sectionBorderRight = window.getComputedStyle(this.sectionRef.current, null).getPropertyValue('border-right')
        const sectionBorderLeft = window.getComputedStyle(this.sectionRef.current, null).getPropertyValue('border-left')

        const width = containerElement.offsetWidth
        
        const innerWidth = width - 
            parseInt(sectionPaddingRight, 10) - 
            parseInt(sectionPaddingLeft, 10) - 
            parseInt(sectionMarginRight, 10) - 
            parseInt(sectionMarginLeft, 10) -
            parseInt(sectionBorderRight, 10) -
            parseInt(sectionBorderLeft, 10)
        const numColumns = this.state.gridLayouts[this.props.section.selectedLayout].numColumns
        
        const columnWidth = innerWidth / numColumns

        this.props.updateSectionWidths({
            innerWidth: innerWidth,
            columnWidth: columnWidth
        }, this.props.sectionIndex)
    }
    */