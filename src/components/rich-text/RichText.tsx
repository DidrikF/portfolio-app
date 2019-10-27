import React from 'react';

import { GlobalContext } from '../../contexts/GlobalContext'
import RichTextToolbarPortal from './RichTextToolbarPortal';
import PageToolbarPortal from './PageToolbarPortal'
import ClassSelector from '../css-manager/ClassSelector';
import { quillItems } from './quil-toobar-config'

import _ from './react-quill/quill-extensions' // Evaluate the module
import Quill from 'quill'

import ReactQuillv2 from './react-quill/ReactQuillv2';
import ReactQuillv2Toolbar from './react-quill/ReactQuillv2Toolbar';
import { ComponentState } from '../../../types/platform_types';
import { Id } from '../../../types/basic-types';
import { IGlobalContext } from '../../App';

export type RichTextProps = {
    updateComponentState: (componentUpdate: Partial<ComponentState>, sectionIndex: number, gridSectionIndex: number, componentStateIndex: number) => void;
    sectionIndex: number;
    gridSectionIndex: number;
    componentStateIndex: number;
    id: Id;
    applyComponentStyles: (sectionIndex: number, gridSectionIndex: number, componentStateIndex: number) => void;
    componentState: ComponentState;
    sectionId: Id;
    miniToolbarHandlers: any; 
}

// Is it possible to refactor this away?
export function updateHeightOfVideos() {
    let videos = Array.from(document.querySelectorAll("iframe.ql-video")) as HTMLElement[];
    if (videos.length > 0) {
        videos.forEach((video) => {
            let videoWidth = video.offsetWidth;
            let videoHeight = videoWidth * (9/16);
            video.style.height = videoHeight + "px";
        });
    }   
}

class RichText extends React.Component<RichTextProps> {
    editorHandlers = [
        (quill: Quill) => {
            quill.once((Quill as any).events.EDITOR_CHANGE, updateHeightOfVideos);
        }
    ]

    constructor(props: RichTextProps) {
        super(props)

        this.updateFocus = this.updateFocus.bind(this);
        this.updateComponentState = this.updateComponentState.bind(this);
        this.handleComponentInputChange = this.handleComponentInputChange.bind(this);
        this.applyComponentStyles = this.applyComponentStyles.bind(this);
        this.updateSelectedClasses = this.updateSelectedClasses.bind(this);
    }

    updateFocus(event: React.SyntheticEvent) {
        this.context.updateComponentInFocus(this.props.id, this.props.componentStateIndex)
        this.context.setActiveRichTextEditor(this.props.id)
    }

    // Passed to quill
    updateComponentState(newState: Partial<ComponentState>) {
        const componentUpdate  = {
            state: newState
        }
        this.props.updateComponentState(componentUpdate, this.props.sectionIndex, this.props.gridSectionIndex, this.props.componentStateIndex)
    }
    
    handleComponentInputChange(event: React.SyntheticEvent<HTMLTextAreaElement, Event> & {target: any}) {
        const value = event.target.value
        const name = event.target.name
        const componentUpdate = {
            [name]: value,
        }
        this.props.updateComponentState(componentUpdate, this.props.sectionIndex, this.props.gridSectionIndex, this.props.componentStateIndex)
    }

    applyComponentStyles(event: React.SyntheticEvent) {
        this.props.applyComponentStyles(this.props.sectionIndex, this.props.gridSectionIndex, this.props.componentStateIndex)
    }
    
    updateSelectedClasses(classes: string) {
        const componentUpdate = {
            className: classes,
        } as Partial<ComponentState>
        this.props.updateComponentState(componentUpdate, this.props.sectionIndex, this.props.gridSectionIndex, this.props.componentStateIndex);
    }

    componentDidMount() {
        setTimeout(updateHeightOfVideos, 500); // Hack to wait for video thumbnail to load, such that the video has some width.
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
                                </div>
                            </div>

                            <ClassSelector 
                                heading="COMPONENT CLASSES" 
                                cssDocument={this.context.cssDocument} 
                                scope="component" 
                                updateSelectedClasses={this.updateSelectedClasses} 
                                activeClasses={this.props.componentState.className} 
                            />
                        
                        </PageToolbarPortal>
                    }

                    
                    <ReactQuillv2 
                        enable={this.context.editing ? true : false}
                        sectionId={this.props.sectionId}
                        id={this.props.id}
                        flashMessage={this.context.flashMessage}
                        // Pass in reference to PageToolbarPortal?


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


RichText.contextType = GlobalContext;

export default RichText;