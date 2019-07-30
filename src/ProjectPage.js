import React from 'react';
import * as _ from 'lodash'
import axios from 'axios';
import { GlobalContext } from './contexts';
import RichText from './content-components/RichText'


class ProjectPage extends React.Component {
    constructor(props) {
        super(props)

        this.onFocus = this.onFocus.bind(this)
        this.updateProjectState = this.updateProjectState.bind(this)
    }

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

    // update a project page to have the exact same data structure as pages, this allows using the same props (at least)

    render() {
        const { id, project } = this.props.location.state
        return (
            <div 
                className="Project"
                onClick={this.onFocus}
                style={{
                    'border': this.context.editable ? ((this.context.componentInFocus === id) ? '1px solid green' : '1px dashed grey') : 'none',
                }}
            > {/*onBlur={this.onBlur}*/}
                <RichText
                    id={id}
                    value={project.state}
                    onChange={this.updateProjectState}
                    // onFocus={}
                    // onBlur={}
                />

                {/**
                key={componentState.id}
                sectionId={this.props.id}
                id={componentState.id}
                sectionIndex={this.props.sectionIndex}
                gridSectionIndex={i}
                componentStateIndex={j}
                componentState={componentState} 
                updateComponentState={this.props.updateComponentState} 
                */}
            </div>
        )
    }
}


ProjectPage.contextType = GlobalContext

export default ProjectPage
