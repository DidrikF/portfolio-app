
import React from 'react';
import { SketchPicker } from 'react-color'
import update from 'immutability-helper';
import { GlobalContext } from './contexts';
import { RichText } from './assets'
import uuidv4 from 'uuid/v4'
import * as _ from 'lodash'

class Section extends React.Component {
    constructor(props) {
        super(props)
        this.containerRef = React.createRef()

        this.state = {
            // the state should be set via props, or fetch by an api call using the 
            // sections 'id' passed down from the parent component
            showColorPicker: false,
            background: '#FFF',
            selectedLayout: 'oneColumn', 
            content: [], // array of  gridSections
 
            /*
            I need to invent a data structure for the state of a section
            I need to express attributes of the section as a whole: layout, background ...
            I need to express attributes of each section of the grid, which changes as the layout is changed
            
            The content of each section of the grid can vary a lot, I need to support an arbitrary 
            number of different "objects"

            I need to be able to persist the state to a database and later be able to recreate the
            react elements, html and css of the section and its columns

            The columns must express which column takes up which space.


            I end up with vary many quill instances...
            */

            gridLayouts: {
                oneColumn: {
                    'gridTemplateColumns': 'minmax(0, 1fr)',
                    numColumns: 1 // not the best... as it does not express a 3D layout, need to update as some point
                },
                twoColumns: {
                    'gridTemplateColumns': 'minmax(0, 1fr) minmax(0, 1fr)',
                    numColumns: 2
                },
                threeColumns: {
                    'gridTemplateColumns': 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
                    numColumns: 3
                },
            // add more layouts as needed, no need why you cant go 3D
            },
            
        }
        
        this.handleColorChange = this.handleColorChange.bind(this)
        this.toggleColorPicker = this.toggleColorPicker.bind(this) 
        this.createLayout = this.createLayout.bind(this)
        this.updateComponentState = this.updateComponentState.bind(this)
        this.deleteComponent = this.deleteComponent.bind(this)
    }

    handleColorChange(color){
        this.setState({ 
            background: color.hex
        });
    }

    toggleColorPicker() {
        this.setState((state, props) => {
            return {
                showColorPicker: state.showColorPicker ? false : true 
            }
        }) 
    }

    handleLayoutChange(e) {
        this.setState({
            selectedLayout: e.target.value
        })
    }

    getId() {
        return uuidv4()
    }

    
    // add logic to recreate columns from state objects
    
    createLayout(event) {
        let gridLayout = this.state.gridLayouts[event.target.name]

        console.log(gridLayout)
        
        if (this.state.content.length !== 0) {
            // add logic to change the layout without loosing content 
        }

        const containerElement = document.getElementsByClassName('Section__container')[0]
        const padding = window.getComputedStyle(containerElement).getPropertyValue('padding')
        let width = this.containerRef.current.offsetWidth
        const innerWidth = width - 2*parseInt(padding, 10)
        const columnWidth = innerWidth / gridLayout.numColumns

        let content = [{
            id: this.getId(),
            style: {
                gridColumnStart: 1,
                gridColumnEnd: gridLayout.numColumns+1,
                width: innerWidth, // px
            },
            coordinates: [1, 0],
            componentStates: [{
                id: this.getId(),
                type: 'rich text',
                state: 'This is a heading or something',
            }],
            components: [],
        }]

        for(let i=1; i <= gridLayout.numColumns; i++) {
            content.push({ // Do I want a column to be able to contain multiple components, quill and an image for instance?
                id: this.getId(),
                style: { // the style express fully which colum should get occupied 
                    gridColumnStart: i,
                    gridColumnEnd: i+1,
                    width: columnWidth, // px
                },
                coordinates: [i, 1], // May extend to 3D layouts, this is somewhat redundant to style
                componentStates: [{ // is the source of truth and state for components in the grid section
                    id: this.getId(),
                    type: 'rich text',
                    state: '',
                }], // React components and markup to be rendered, can be created from componentStates
                components: [], // objects which holds the states of components, such that they can be recreated
            })
        }

        content = this.buildComponents(content)

        this.setState({
            content: content, // array of  gridSections
            selectedLayout: event.target.name,
        })
        
        // this.updateDimensions(); // updates the content.gridSections width property
    }

    findComponentStateIndex(state, id) {
        let contentIndex = undefined
        let componentStateIndex = undefined
        for(let i=0; i<state.content.length; i++) {
            for(let j=0; j<state.content[i].componentStates.length; j++) {
                if (state.content[i].componentStates[j].id === id) {
                    contentIndex = i
                    componentStateIndex = j 
                    break
                }
            }
            if (typeof contentIndex !== 'undefined') break
        }
        return [contentIndex, componentStateIndex]
    }

    findComponentIndex(state, id) {
        let contentIndex = undefined
        let componentIndex = undefined
        for(let i=0; i<state.content.length; i++) {
            for(let j=0; j<state.content[i].components.length; j++) {
                if (state.content[i].components[j].id === id) {
                    contentIndex = i
                    componentIndex = j 
                    break
                }
            }
            if (typeof contentIndex !== 'undefined') break
        }
        return [contentIndex, componentIndex]
    }



    updateComponentState(componentState) {
        this.setState((state, props) => {
            // find the object
            // need to iterate over both gridSections and component states
            let [contentIndex, componentStateIndex] = this.findComponentStateIndex(state, componentState.id)

            // update the object
            for (let key in componentState) {
                state.content[contentIndex].componentStates[componentStateIndex][key] = componentState[key]
            }

            return {
                content: state.content
            }
        })
    }

    // This is only called once when the sections grid is first
    // Build the components of a grid section from componentStates. 
    // created or when loading the state from the database. 
    buildComponents(content) {
        // need to iterate over both gridSections and their componentStates. 
        content.forEach(gridSection => {
            gridSection.components = gridSection.componentStates.map(componentState => {
                if (componentState.type === 'rich text') {
                    var component = (<RichText 
                        key={componentState.id}
                        componentState={componentState} 
                        updateComponentState={this.updateComponentState} 
                        delete={this.deleteComponent.bind(this, componentState.id)}
                    />)
                } else if (componentState.type === 'unsplash image') {
    
                }

                return component
            })
        })

        return content
    }

    deleteComponent(id) {
        this.setState((state, props) => {
            let [contentIndex, componentStateIndex] = this.findComponentStateIndex(state, id)
            let [contentIndex2, componentIndex] = this.findComponentIndex(state, id)

            // delete the component state and re-render or delete the component as well 
            state.content[contentIndex].componentStates.splice(componentStateIndex, 1)
            state.content[contentIndex].components.splice(componentIndex, 1)

            return {
                content: state.content
            }
        })
    }
     
    updateDimensions() {
        // console.log(document.getElementsByClassName('Section__container'))
        const containerElement = document.getElementsByClassName('Section__container')[0]
        const padding = window.getComputedStyle(containerElement).getPropertyValue('padding')
        let width = this.containerRef.current.offsetWidth
        const innerWidth = width - 2*parseInt(padding, 10)
        const columnWidth = innerWidth / this.state.gridLayouts[this.state.selectedLayout].numColumns
        // console.log('inner width: ', innerWidth)
        // console.log('num columns: ', this.state.gridLayouts[this.state.selectedLayout].numColumns)
        // console.log('column width: ', columnWidth)
        // console.log(parseInt(padding, 10))
        // console.log(this.containerRef.current.offsetWidth)

        this.setState((state, props) => {
            let content = state.content.map(gridSection => {
                if (gridSection.coordinates[1] === 0) {
                    gridSection = update(gridSection, {style: {width: {$set: innerWidth}}})
                    // gridSection.style['width'] = innerWidth
                } else if (gridSection.coordinates[1] === 1) { // only the second "row" has dynamic width
                    gridSection = update(gridSection, {style: {width: {$set: columnWidth}}})
                    // gridSection.style['width'] = columnWidth
                } 
                return gridSection
            })
            
            return {
                content: content
            }
        })
    }

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
            <div className="Section__container" ref={this.containerRef} style={{
                'backgroundColor': this.state.background, 
                'gridTemplateColumns': this.state.gridLayouts[this.state.selectedLayout]['gridTemplateColumns']}
            }>
                
                {this.context.editable && 
                    <div className="Section__toolbar">
                        <div className='Section__toolbarMenu'>
                            <i className="fas fa-palette Section__toolbarButton" onClick={this.toggleColorPicker}/>
                            <button className="Section__toolbarButton" onClick={this.createLayout} name='oneColumn'>1 Column</button>
                            <button className="Section__toolbarButton" onClick={this.createLayout} name='twoColumns'>2 Column</button>
                            <button className="Section__toolbarButton" onClick={this.createLayout} name='threeColumns'>3 Column</button>
                        </div>
                        <div className='Section__toolbarWidgets'>
                            {this.state.showColorPicker &&
                                
                                <SketchPicker 
                                    color={this.state.background}
                                    onChangeComplete={this.handleColorChange}
                                />
                            }
                        </div>
                    </div>
                }
                
                {this.state.content.map(gridSection => {
                    return (
                        <div style={gridSection.style} key={gridSection.id}>
                            { gridSection.components }
                        </div>
                    )
                })}
                



            </div>
        )
    }
}

Section.contextType = GlobalContext

export default Section
