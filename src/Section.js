
import React from 'react';
import { GlobalContext } from './contexts';
import RichText from './RichText'
import * as _ from 'lodash'
import 'react-quill/dist/quill.snow.css';
import { getId, gridLayouts } from './helpers' 


class Section extends React.Component {
    constructor(props) {
        super(props)
        this.containerRef = React.createRef()

        this.state = {
            gridLayouts: gridLayouts
        }
        
        this.onFocus = this.onFocus.bind(this)
        this.gridSectionOnFocus = this.gridSectionOnFocus.bind(this)
        // this.onBlur = this.onBlur.bind(this)
    }


     
    updateDimensions() { // Display dimentions are only interesting to this component, and it should therefore be possible to
        // handle this state locally 
        // console.log(document.getElementsByClassName('Section__container'))
        const containerElement = document.getElementsByClassName('Sections')[0] // The width will be equal for all Section containers
        // window.getComputedStyle(containerElement).getPropertyValue('padding')
        const padding = this.props.style.padding
        //let width = this.containerRef.current.offsetWidth
        const width = containerElement.offsetWidth
        
        const innerWidth = width - 2*parseInt(padding, 10)
        const columnWidth = innerWidth / this.state.gridLayouts[this.props.selectedLayout].numColumns
        // console.log('inner width: ', innerWidth)
        // console.log('num columns: ', this.state.gridLayouts[this.state.selectedLayout].numColumns)
        // console.log('column width: ', columnWidth)
        // console.log(parseInt(padding, 10))
        // console.log(this.containerRef.current.offsetWidth)

        // Update section.gridSection state : 
        this.props.updateSectionState({
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

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener("resize", this.updateDimensions.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateDimensions.bind(this));
    }

    render() {
        // things are either an input or a span
        return (
            <div className="Section__container" ref={this.containerRef} onClick={this.onFocus} style={{ // onBlur={this.onBlur}
                ...this.props.style,
                //'backgroundColor': this.props.style.background, 
                //'padding': this.props.style.padding, // can add more configurable styles below
                'gridTemplateColumns': this.state.gridLayouts[this.props.selectedLayout]['gridTemplateColumns'],
                'border': this.context.editable ? ((this.context.sectionInFocus === this.props.id) ? '1px solid red' : '1px dashed grey') : 'none',
            }}>
                {this.props.gridSections.map((gridSection, i) => {
                    return (
                        <div 
                            style={{...gridSection.style,
                                'border': this.context.editable ? ((this.context.gridSectionInFocus === gridSection.id) ? '1px solid blue' : '1px dashed grey') : 'none',
                            }} 
                            key={gridSection.id}
                            onClick={() => { this.gridSectionOnFocus(gridSection.id, i) }}
                        > {/* gridSection.style['width'] */}
                        
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
                                updateComponentState={this.props.updateComponentState} 
                            />)
                        })}
                        </div>
                    )


                    
                    /*
                    return (
                        <div style={gridSection.style} key={gridSection.id}>
                            { gridSection.components }
                        </div>
                    )*/
                })}
                



            </div>
        )
    }
}

Section.contextType = GlobalContext

export default Section


/*
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