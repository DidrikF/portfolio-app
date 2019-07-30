
import React from 'react';
import { GlobalContext } from './contexts';
import RichText from './content-components/RichText'
import * as _ from 'lodash'
import 'react-quill/dist/quill.snow.css';
import { getId, gridLayouts } from './helpers' 
import { SketchPicker } from 'react-color'

class Section extends React.Component {
    constructor(props) {
        super(props)
        this.sectionRef = React.createRef()
        this.columnRef = React.createRef()

        this.state = {
            gridLayouts: gridLayouts,

            showColorPicker: false,
            colorPickerState: {},
            colorPickerColor: this.props.section.style.background ? this.props.section.style.background : "#fff",


            border: "",
            padding: "",
            margin: "",

            gridSection: {
                border: "",
                padding: "", 
                margin: "",
            }
        }
        
        this.onFocus = this.onFocus.bind(this)
        this.gridSectionOnFocus = this.gridSectionOnFocus.bind(this)
        this.toggleColorPicker = this.toggleColorPicker.bind(this)
        this.handleColorChange = this.handleColorChange.bind(this)

        this.handleGridSectionInputChange = this.handleGridSectionInputChange.bind(this)
        this.applyGridSectionStyles = this.applyGridSectionStyles.bind(this)
        this.handleSectionInputChange = this.handleSectionInputChange.bind(this)
        this.applySectionStyles = this.applySectionStyles.bind(this)
        // this.onBlur = this.onBlur.bind(this)
    }


    // May be able to get around this...
    updateDimensions() {
        const containerElement = document.getElementsByClassName('Page')[0]
        const sectionPaddingRight = window.getComputedStyle(this.sectionRef.current, null).getPropertyValue('padding-right')
        const sectionPaddingLeft = window.getComputedStyle(this.sectionRef.current, null).getPropertyValue('padding-left')
        const sectionMarginRight = window.getComputedStyle(this.sectionRef.current, null).getPropertyValue('margin-right')
        const sectionMarginLeft = window.getComputedStyle(this.sectionRef.current, null).getPropertyValue('margin-right')

        const width = containerElement.offsetWidth
        
        const innerWidth = width - parseInt(sectionPaddingRight, 10) - parseInt(sectionPaddingLeft, 10) - parseInt(sectionMarginRight, 10) - parseInt(sectionMarginLeft, 10)
        const numColumns = this.state.gridLayouts[this.props.section.selectedLayout].numColumns
        
        const columnWidth = innerWidth / numColumns

        this.props.updateSectionWidths({
            innerWidth: innerWidth,
            columnWidth: columnWidth
        }, this.props.sectionIndex)
    }

    onFocus () { 
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

    handleSectionInputChange(e) {
        const name = e.target.name
        const value = e.target.value
        this.setState({
            [name]: value
        })
    }

    applySectionStyles(e) {
        if (e.keyName !== "Enter") return
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

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

    componentDidUpdate(prevProps) {
        if ((prevProps.enableSpacing !== this.props.enableSpacing) || (prevProps.selectedLayout !== this.props.selectedLayout)) {
            this.updateDimensions()
        }
    }

    contextChanged() {
        return false
    }

    handleColorChange(color) {
        this.setState({
            colorPickerColor: color.hex,
            colorPickerState: color
        })

        const update = {
            style: {
                background: color.hex
            }
        }

        if (this.context.gridSectionInFocus) {
            this.props.updateGridSectionState(update, this.context.sectionInFocusIndex, this.context.gridSectionInFocusIndex)
        } else if (this.context.sectionInFocus) {
            this.props.updateSectionState(update, this.context.sectionInFocusIndex)
        }
    }

    toggleColorPicker() {
        this.setState((state, props) => {
            return {
                showColorPicker: state.showColorPicker ? false : true,
            }
        }) 
    }

    render() {
        // things are either an input or a span
        return (
            <div 
                className={"Section__container " + (this.context.enableSpacing ? "spacing" : "")} 
                ref={this.sectionRef} 
                onClick={this.onFocus} 
                style={{ // onBlur={this.onBlur}
                    ...this.props.section.style,
                    'gridTemplateColumns': this.state.gridLayouts[this.props.section.selectedLayout]['gridTemplateColumns'],
                    'border': this.context.enableSpacing ? ((this.context.sectionInFocus === this.props.id) ? '1px solid red' : '1px dashed grey') : 'none',
                }}
            >
                { (!this.context.gridSectionInFocus && (this.context.sectionInFocus === this.props.id)) && 
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
                        <button className="Section__toolbar-button"><i className="material-icons">arrow_drop_up</i></button>
                        <button className="Section__toolbar-button"><i className="material-icons">arrow_drop_down</i></button>

                        <button className="Section__toolbar-button"><i className="material-icons">insert_photo</i></button>
                        <button className="Section__toolbar-color-button" onClick={this.toggleColorPicker} style={{background: this.state.colorPickerColor}}></button>
                        {this.state.showColorPicker &&
                            <SketchPicker
                                className="Section__toolbar-color-pallet"
                                color={this.state.colorPickerState}
                                onChangeComplete={this.handleColorChange}
                            />
                        }

                        <input className="Section__toolbar-input" placeholder="Border"/>
                        <input className="Section__toolbar-input" placeholder="Padding"/>
                        <input className="Section__toolbar-input" placeholder="Margin"/>

                        <button className="Section__toolbar-button"><i className="material-icons">delete</i></button>
                    </div>
                }
                

                
                



                {this.props.section.gridSections.map((gridSection, i) => {
                    return (
                        <div 
                            className={"GridSection "  + (this.context.enableSpacing ? "spacing" : "")}
                            style={{...gridSection.style,
                                'border': this.context.enableSpacing ? ((this.context.gridSectionInFocus === gridSection.id) ? '1px solid blue' : '1px dashed grey') : 'none',
                            }} 
                            key={gridSection.id}
                            onClick={() => { this.gridSectionOnFocus(gridSection.id, i) }}
                        > {/* gridSection.style['width'] */}

                        {/* Grid Section Toolbar (very similar to section toolbar */}
                        { (this.context.gridSectionInFocus === gridSection.id) && 
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
                        }
                        
                        {gridSection.componentStates.map((componentState, j) => {
                            // Need to accomedate for different component types here
                            return (<RichText 
                                key={componentState.id}
                                sectionId={this.props.id}
                                id={componentState.id}

                                sectionIndex={this.props.sectionIndex}
                                gridSectionIndex={i}
                                componentStateIndex={j}

                                componentState={componentState} 
                                updateComponentState={this.props.updateComponentState} // need to wrap this and make it called onChange
                            />)
                        })}
                        </div>
                    )
                })}
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
*/