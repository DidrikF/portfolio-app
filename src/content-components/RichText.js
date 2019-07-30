import React from 'react';

import { GlobalContext } from '../contexts'
import RichTextToolbarPortal from './RichTextToolbarPortal';
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
    }

    updateFocus() {
        this.context.updateComponentInFocus(this.props.id, this.props.componentStateIndex)
        this.context.setActiveRichTextEditor(this.props.id)
    }

    updateComponentState(newState) {
        let componentState = this.props.componentState
        componentState.state = newState
        this.props.updateComponentState(componentState, this.props.sectionIndex, this.props.gridSectionIndex, this.props.componentStateIndex)
    }
    
    

    render() {
        return (
            <div
                className={"RichText__container"}
                onClick={this.updateFocus}
                style={{
                    'border': this.context.enableSpacing ? ((this.context.componentInFocus === this.props.id) ? '1px solid green' : '1px dashed grey') : 'none',
                    'position': 'relative',
                }}
            > {/*onBlur={this.onBlur}*/}
                <RichTextToolbarPortal> 
                    <ReactQuillv2Toolbar
                        style={{ display: (this.context.activeRichTextEditor === this.props.id) ? 'block' : 'none' }}
                        id={'QuillToolbar__' + this.props.id}
                        theme='snow'
                        items={quillItems} // replaces formats in some way?
                    />
                </RichTextToolbarPortal>

                
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

        )
    }
}


RichText.contextType = GlobalContext
