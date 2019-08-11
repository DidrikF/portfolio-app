import React from 'react';

import { GlobalContext } from '../contexts'
import RichTextToolbarPortal from './RichTextToolbarPortal';
import PageToolbarPortal from '../helper-components/PageToolbarPortal'
import { quillItems } from './config'

import _ from './react-quill/quill-extensions' // Evaluate the module
import Quill from 'quill'

import ReactQuillv2 from './react-quill/ReactQuillv2';
import ReactQuillv2Toolbar from './react-quill/ReactQuillv2Toolbar';



export function updateHeightOfVideos() {
    let videos = document.querySelectorAll("iframe.ql-video")
    if (videos.length > 0) {
        for(let video of videos) {
            let videoWidth = video.offsetWidth;
            let videoHeight = videoWidth * (9/16);
            video.style.height = videoHeight + "px";
        }
    }
}

export default class RichText extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

        }

        this.editorHandlers = [
            (quill) => {
                quill.once(Quill.events.EDITOR_CHANGE, updateHeightOfVideos);
            }
        ]

        this.updateComponentState = this.updateComponentState.bind(this)
        this.updateFocus = this.updateFocus.bind(this)
        this.handleComponentInputChange = this.handleComponentInputChange.bind(this)
        this.applyComponentStyles = this.applyComponentStyles.bind(this)
    }

    updateFocus(e) {
        // e.stopPropagation()
        this.context.updateComponentInFocus(this.props.id, this.props.componentStateIndex)
        this.context.setActiveRichTextEditor(this.props.id)
    }

    updateComponentState(newState) {
        const componentUpdate  = {
            state: newState
        }
        this.props.updateComponentState(componentUpdate, this.props.sectionIndex, this.props.gridSectionIndex, this.props.componentStateIndex)
    }
    
    handleComponentInputChange(e) {
        const value = e.target.value
        const name = e.target.name
        const componentUpdate = {
            [name]: value,
        }

        this.props.updateComponentState(componentUpdate, this.props.sectionIndex, this.props.gridSectionIndex, this.props.componentStateIndex)
    }

    applyComponentStyles(e) {
        this.props.applyComponentStyles(this.props.sectionIndex, this.props.gridSectionIndex, this.props.componentStateIndex)
    }
    

    componentDidMount() {
        setTimeout(updateHeightOfVideos, 500)
    }
    
    

    render() {
        return (
            <div
                style={{
                    'border': this.context.enableSpacing ? ((this.context.componentInFocus === this.props.id) ? '1px solid green' : '1px dashed grey') : 'none',
                    'position': 'relative',
                }}
            >
                <div
                    className={"RichText__container " + this.props.componentState.className}
                    onClick={this.updateFocus}
                    style={this.props.componentState.style}
                > {/*onBlur={this.onBlur}*/}
                    <RichTextToolbarPortal> 
                        <ReactQuillv2Toolbar
                            style={{ display: (this.context.activeRichTextEditor === this.props.id) ? 'block' : 'none' }}
                            id={'QuillToolbar__' + this.props.id}
                            theme='snow'
                            items={quillItems} // replaces formats in some way?
                        />
                    </RichTextToolbarPortal>
                    { (this.context.componentInFocus === this.props.id) && 
                        // Section Toolbar side
                        <PageToolbarPortal>
                            <div className="SN__container">
                                <p className="SN__menu-title">COMPONENT CONFIG</p>
                                <div className='SN__widget'> {/* Section__toolbarMenu */}
                                    <textarea 
                                        className={"SN__input-textarea"} 
                                        placeholder="Styles in JSON format"
                                        name="styleInput"
                                        value={this.props.componentState.styleInput}
                                        onChange={this.handleComponentInputChange} // OBS
                                    >
                                    </textarea>
                                    <button className="SN__button-normal SN__button--create" onClick={this.applyComponentStyles}>Apply Styles</button>
                                    <button className="Section__toolbar-button" onClick={this.props.deleteObject}><i className="material-icons">delete</i></button>
                                </div>
                            </div>
                        </PageToolbarPortal>
                    }

                    
                    <ReactQuillv2 
                        enable={this.context.editing ? true : false}
                        sectionId={this.props.sectionId}
                        id={this.props.id}
                        /**might not need */
                        sectionIndex={this.props.sectionIndex}
                        gridSectionIndex={this.props.gridSectionIndex}
                        componentStateIndex={this.props.componentStateIndex}
                        
                        editorHandlers={this.editorHandlers} // does not respond to updates, this is dirty
                        miniToolbarHandlers={this.miniToolbarHandlers}

                        value={this.props.componentState.state} 
                        onChange={this.updateComponentState} // need to wrap this and make it called onChange
                    />


                </div>
            </div>
        )
    }
}


RichText.contextType = GlobalContext
