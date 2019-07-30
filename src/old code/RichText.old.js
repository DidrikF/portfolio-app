// this file contains page assets

import ReactQuill from 'react-quill';
import React from 'react'
import { GlobalContext } from '../contexts'
import Portal from './react-quill/RichTextToolbarPortal'
import { quillItems } from '../helpers';
import Quill, { Emitter } from 'quill'
import Delta from 'quill-delta';
import { notEqual } from 'assert';

let Inline = Quill.import('blots/inline');
let Block = Quill.import('blots/block');
let BlockEmbed = Quill.import('blots/block/embed');

class SideImage extends BlockEmbed {
    static create(value) {
        let node = super.create();
        node.setAttribute('alt', value.alt);
        node.setAttribute('src', value.src);
        // conditinal logic to set the styling of the image...
        node.setAttribute('style', 'width: 50%; float: right;')
        return node;
    }

    static value(node) {
        return {
            alt: node.getAttribute('alt'),
            url: node.getAttribute('src'),
            style: node.getAttribute('style')
        };
    }
}
SideImage.blotName = 'sideimage';
SideImage.tagName = 'img';

Quill.register(SideImage)

function imageHandler(image, callback) {
    console.log("From the image handler: ", image) // is a File objest, see the File-web-api docs for info
    /*
    var formData = new FormData();
    formData.append('image', image, image.name);
  
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'handler.php', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        callback(xhr.responseText);
      }
    };
    xhr.send(formData);
    */
    callback("given to callback"); // takes the src attribute value
};

// collaps all RichText functiononality into ReactQuill? 
export default class RichText extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            showTooltip: false,
            toolTip: {
                left: 0,
                top: 0,
            } 
        }
        // this.el = document.createElement('div');

        this.onFocus = this.onFocus.bind(this)
        // this.onBlur = this.onBlur.bind(this)
        this.updateComponentState = this.updateComponentState.bind(this)
        // this.delete = this.delete.bind(this)
    }

    modules = {
        toolbar: {
            container: '#QuillToolbar__' + this.props.id,
            handlers: {
                'sideimage': function (value) {
                    let range = this.quill.getSelection(true); // need the editor instance. 
                    this.quill.insertEmbed(range.index, 'sideimage', {
                        alt: window.prompt("Alt: ", ""),
                        src: window.prompt("Src: ", "")
                    }, Quill.sources.USER);
                    this.quill.setSelection(range.index + 1, Quill.sources.SILENT);

                },

                'image': function () { // this is the toolbar instance!
                    let fileInput = this.container.querySelector('input.ql-image[type=file]');
                    if (fileInput == null) {
                        fileInput = document.createElement('input');
                        fileInput.setAttribute('type', 'file');
                        fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
                        fileInput.classList.add('ql-image');
                        fileInput.addEventListener('change', () => {
                            if (fileInput.files != null && fileInput.files[0] != null) {
                                let reader = new FileReader();
                                reader.onload = (e) => {
                                    // upload image to server, to any needed image processing and return a link to the uploaded image
                                    let range = this.quill.getSelection(true);
                                    console.log(e.target.result)
                                    // maybe a need to to this when i want to change the style of an existing element?
                                    this.quill.updateContents(new Delta()
                                        .retain(range.index)
                                        .delete(range.length)
                                        .insert({
                                            sideimage: {
                                                alt: "test image",
                                                src: 'https://cdn.pixabay.com/photo/2013/07/12/17/47/test-pattern-152459_960_720.png'
                                            }
                                        })
                                        //.insert({ image: e.target.result }) // this is where the editor is updated with the image Blot/html-element
                                        , Quill.sources.USER);
                                    this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
                                    fileInput.value = "";
                                }
                                reader.readAsDataURL(fileInput.files[0]);
                            }
                        });
                        this.container.appendChild(fileInput); // adds a hidden image input to the toolbar which gets clicked when
                    }

                    fileInput.click();
                },
            },
        },
        syntax: true
    }

    // need to remove handlers... or is is already implemented?
    customHandlers = [(quill) => {
        quill.on(Quill.events.EDITOR_CHANGE, function (eventType, range) {
            console.log("CUSTOM HANDLER CALLED; this is: ", this, " quill is: ", quill)
            if (eventType !== Quill.events.SELECTION_CHANGE) return;
            if (range == null) return;
            if (range.length === 0) {
                // hide controls
                this.hideTooltip()
            } else {
                let rangeBounds = quill.getBounds(range); /* 
                { // I dont know the reference point...
                bottom: 29.34661865234375
                height: 14.54547119140625
                left: 81.4488525390625
                right: 171.07952880859375
                top: 14.8011474609375
                width: 89.63067626953125
            } */
                let controlsElement = document.getElementById('tooltip-controls'+this.props.id)
                // console.log("props.id in custom handler: ", this.props.id)
                // console.log(controlsElement) // need to have the node rendered, and use display property to toggle
                if (controlsElement) {
                    var elementWidth = controlsElement.offsetWidth
                }
                this.showTooltip({
                    left: rangeBounds.left + rangeBounds.width / 2 - elementWidth / 2 - 60, 
                    top: rangeBounds.bottom + 12
                })
            }
        }.bind(this));
    }]


    toolbarHandlers = [

    ]

    hideTooltip() {
        this.setState({
            showTooltip: false
        })
    }
    showTooltip(css) {
        this.setState({
            showTooltip: true,
            toolTip: {
                left: css.left,
                top: css.top
            } 
        })
    } 

    formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image'
    ]

    onFocus() {
        // console.log('component on focus props: ', this.props.id, this.props.gridSectionIndex, this.props.componentStateIndex)
        this.context.updateComponentInFocus(this.props.id, this.props.componentStateIndex)
        this.context.setActiveRichTextEditor(this.props.id)
    }

    /*
    onBlur() { // Not working, presumably due to the order onBlur and onFocus is called in.
        if (this.context.componentInFocus === this.props.id) {
            this.context.updateComponentInFocus('') // 
        }
    }
    */

    updateComponentState(newState) {
        let componentState = this.props.componentState
        componentState.state = newState
        this.props.updateComponentState(componentState, this.props.sectionIndex, this.props.gridSectionIndex, this.props.componentStateIndex)
    }


    render() {
        return (
            <div
                onClick={this.onFocus}
                style={{
                    'border': this.context.editable ? ((this.context.componentInFocus === this.props.id) ? '1px solid green' : '1px dashed grey') : 'none',
                    'position': 'relative',
                }}
            > {/*onBlur={this.onBlur}*/}

                <Portal>
                    <ReactQuill.Toolbar
                        style={{ display: (this.context.activeRichTextEditor === this.props.id) ? 'block' : 'none' }}
                        id={'QuillToolbar__' + this.props.id}
                        theme='snow'
                        items={quillItems}
                    />
                </Portal>
                <div id={"tooltip-controls"+this.props.id} className="tooltip-controls" style={{
                    left: this.state.toolTip.left,
                    top: this.state.toolTip.top, 
                    display: this.state.showTooltip ? 'block' : 'none',
                }}>
                    <button id="bold-button" onClick={this.shiftImageLeft}><i className="fa fa-bold"></i></button>
                    <button id="italic-button" onClick={this.shiftImageRight}><i className="fa fa-italic"></i></button>
                    <button id="link-button"><i className="fa fa-link"></i></button>
                    <button id="blockquote-button"><i className="fa fa-quote-right"></i></button>
                    <button id="header-1-button"><i className="fa fa-header"><sub>1</sub></i></button>
                    <button id="header-2-button"><i className="fa fa-header"><sub>2</sub></i></button>
                </div>

                <ReactQuill
                    value={this.props.componentState.state}
                    onChange={this.updateComponentState}
                    theme="snow"
                    modules={this.modules}
                    imageHandler={imageHandler}
                    customHandlers={this.customHandlers}
                />
            </div>
        )
    }
}

RichText.contextType = GlobalContext




/*
Props:

key={componentState.id}
sectionId={this.props.id}
id={componentState.id}

sectionIndex={this.props.sectionIndex}
gridSectionIndex={i}
componentStateIndex={j}

componentState={componentState}
updateComponentState={this.props.updateComponentState}
delete={this.props.deleteComponent.bind(this, componentState.id)}



Notes:


RichText.modules = {
    toolbar: {
        container: "#Section__quillToolbar",
    }
}


{ ReactDOM.createPortal(
    this.props.toolbar,
    this.el,
) }



handleChange(newState) {
    let componentState = this.props.componentState
    componentState.state = newState
    this.props.updateComponentState(componentState)
}


*/