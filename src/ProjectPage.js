import React from 'react';
import ReactQuill, { Quill, Mixin, Toolbar } from 'react-quill';
import * as _ from 'lodash'
import axios from 'axios';
import { GlobalContext } from './contexts';
import Portal from './Portal'
import { quillItems } from './helpers';

let Inline = Quill.import('blots/inline');

class LinkBlot extends Inline {
  static create(url) {
    let node = super.create();
    node.setAttribute('href', url);
    node.setAttribute('target', '_blank');
    node.setAttribute('title', node.textContent);
    return node;
  }

  static formats(domNode) {
    return domNode.getAttribute('href') || true;
  }

  format(name, value) {
    if (name === 'link' && value) {
      this.domNode.setAttribute('href', value);
    } else {
      super.format(name, value);
    }
  }

  formats() {
    let formats = super.formats();
    formats['link'] = LinkBlot.formats(this.domNode);
    return formats;
  }
}
LinkBlot.blotName = 'link';
LinkBlot.tagName = 'A';

// Quill.register(LinkBlot);
class BoldBlot extends Inline { }
BoldBlot.blotName = 'bold';
BoldBlot.tagName = 'strong';

class ItalicBlot extends Inline { }
ItalicBlot.blotName = 'italic';
ItalicBlot.tagName = 'em';

Quill.register(BoldBlot);
Quill.register(ItalicBlot);


class ProjectPage extends React.Component {
    constructor(props) {
        super(props)
        this.rqRef = React.createRef()
        this.onFocus = this.onFocus.bind(this)
        this.updateProjectState = this.updateProjectState.bind(this)
        this.toggleBold = this.toggleBold.bind(this)
    }
    
    modules = {
        toolbar: '#QuillToolbar__' + this.props.match.params.id,
        syntax: true
    }

    formats = [
        'header',
        'bold', 'italic', 'underline', 'strike', 'blockquote',
        'list', 'bullet', 'indent',
        'link', 'image',
    ]

    onFocus() {
        const { id, projectIndex } = this.props.location.state
        this.context.updateProjectInFocus(id, projectIndex) // Need to create
        this.context.setActiveRichTextEditor(id)
    }

    updateProjectState(newState) {
        const { project, projectIndex, updateProjectState } = this.props.location.state
        project.state = newState
        updateProjectState(project, projectIndex) // need to create    
    }

    toggleBold() {
        let quill = this.rqRef.getEditor()
        quill.format('bold', true); // need access to the quill instance...
    }


    render() {
        console.log(this.props.location)
        const { id, project } = this.props.location.state
        return (
            <div 
                className="Project"
                onClick={this.onFocus}
                style={{
                    'border': this.context.editable ? ((this.context.componentInFocus === id) ? '1px solid green' : '1px dashed grey') : 'none',
                }}
            > {/*onBlur={this.onBlur}*/}
                
                <Portal>
                    <ReactQuill.Toolbar
                        style={{display: (this.context.activeRichTextEditor === id) ? 'block' : 'none'}}
                        id={'QuillToolbar__' + id} // will work the same accross projects and components
                        theme='snow'
                        items={quillItems}
                    />
                </Portal>

                <div id="tooltip-controls">
                    <button id="bold-button" onClick={this.toggleBold}><i className="fa fa-bold"></i></button>
                    <button id="italic-button"><i className="fa fa-italic"></i></button>
                    <button id="link-button"><i className="fa fa-link"></i></button>
                    <button id="blockquote-button"><i className="fa fa-quote-right"></i></button>
                    <button id="header-1-button"><i className="fa fa-header"><sub>1</sub></i></button>
                    <button id="header-2-button"><i className="fa fa-header"><sub>2</sub></i></button>
                </div>
                <div id="sidebar-controls">
                    <button id="image-button"><i className="fa fa-camera"></i></button>
                    <button id="video-button"><i className="fa fa-play"></i></button>
                    <button id="tweet-button"><i className="fab fa-twitter"></i></button>
                    <button id="divider-button"><i className="fa fa-minus"></i></button>
                </div>


                <ReactQuill
                    ref={this.rqRef}
                    value={project.state}
                    onChange={this.updateProjectState}
                    theme="snow"
                    modules={this.modules}
                    // formats={this.formats} // all is enabled by default
                />
            </div>
        )
    }
}


ProjectPage.contextType = GlobalContext


export default ProjectPage
