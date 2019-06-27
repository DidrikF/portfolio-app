import React from 'react';
import {RichText} from './assets'
import * as _ from 'lodash'
import axios from 'axios';

// everything must be top down

export default class ProjectPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            title: '', 
            description: '',
            show: '', 
            page_state: [],
            id: props.match.params.id,
            message: '', 
        }
        this.addAsset = this.addAsset.bind(this)
        this.updatePageState = this.updatePageState.bind(this)
        this.updateAssetState = this.updateAssetState.bind(this)
        this.changeTitle = this.changeTitle.bind(this)
        this.savePage = this.savePage.bind(this)
        this.loadPage = this.loadPage.bind(this)
    }

    changeTitle(e) {
        this.setState({
            title: e.target.value
        })
    }

    getComponentId() {
        if (this.state.page_state.length > 0) {
            console.log(this.state.page_state)
            var highest_id = this.state.page_state.reduce((highest, next) => (next.id > highest) ? next.id : highest, -1);
        } else {
            var highest_id = 0
        }
        return highest_id + 1
    }

    updateAssetState(assetState) {
        
        this.setState((state, props) => {
            // find the object
            let index = state.page_state.findIndex((curAssetState => curAssetState.id === assetState.id))
            // update the object
            for (let key in assetState) {
                state.page_state[index][key] = assetState[key]
            }

            return {
                page_state: state.page_state
            }
            
        })
    }

    updatePageState(update) {
        // update the respective page state object
        // later I can add insert, update and delete of components and component position
    }

    deleteAsset(id) {
        this.setState((state, props) => {
            let new_page_state = _.remove(state.page_state, (assetState) => {
                return assetState.id !== id
            }) 
            return {
                page_state: new_page_state
            }
        })
    }

    addAsset(assetToAdd) {
        var assetState = {
            id: this.getComponentId(),
        }

        if (assetToAdd === 'rich text') {
            assetState.text = ''
            assetState.type = 'rich text'
            assetState.component = (<RichText 
                assetState={assetState} 
                updateAssetState={this.updateAssetState} 
                delete={this.deleteAsset.bind(this, assetState.id)}
            />)
        
        } else if (assetToAdd === 'unspalsh image') {

        }
        
        // be able to define where to insert the asset
        this.setState((state,props) => {
            let page_state = [...state.page_state, assetState]
            return {
                page_state: page_state
            }
        })

    }

    savePage() { 
        console.log('id before save', this.props.match.params.id)
        // create state object
        let page_state = this.state.page_state.map(assetState => {
            return _.omit(assetState, 'component')
        })

        console.log("page state before savin", page_state)

        let update = {
            title: this.state.title, 
            description: this.state.description,
            show: this.state.show, 
            page_state: page_state,
        }
        // sage it to the database
        axios.put('/projects/' + this.props.match.params.id, update).then(response => {
            console.log("Saved successfully")
            this.message = 'Saved the project!' // remove after a timer triggers
            this.props.updateNavigation()
            // show a modal or a status message in the corner 
        }).catch(error => {
            console.log(error)
            this.message = 'Failed to save project'
        })
    }

    loadPage(props) { 
        console.log('id before load', props.match.params.id)

        axios.get('/projects/'+props.match.params.id).then(response => {
            console.log('load page response', response.data)
            this.setState({
                id: response.data._id,
                title: response.data.title,
                description: response.status.description,
                show: response.data.show, 
                page_state: (response.data.page_state) ? this.buildPageState(response.data.page_state) : []
            })
        }).catch(error => {
            console.log(error)
            this.message = 'Failed to load project page'
        })
    } 
 
    // extract a buildComponent function that takes in an assetState... this avoids duplication
    buildPageState(page_state) {
        let completed_page_state = page_state.map(assetState => {
            if (assetState.type === 'rich text') {
                assetState.component = (<RichText 
                    assetState={assetState} 
                    updateAssetState={this.updateAssetState} 
                    delete={this.deleteAsset.bind(this, assetState.id)}
                />)
            } else if (assetState.type === 'unsplash image') {

            }
            return assetState
        })

        return completed_page_state
    }


    componentDidMount() {
        this.loadPage(this.props)
    }

    componentWillReceiveProps(nextProps) { 
        // props have not been updated yet at this point, so when you use this.props here, you are
        // referencing the old props. Pass nextProps to the functions that need the new props. 
        if (nextProps.location.pathname !== this.props.location.pathname) {
            console.log('component will receive props called, next props: ', nextProps)
            this.loadPage(nextProps)

        }
    }

    render() {
        return (
            <div>
                <h2>Project Page</h2>
                <AddAsset addAsset={this.addAsset}/>
                <input value={this.state.title} onChange={this.changeTitle}/>
                {
                    this.state.page_state.map((assetState) => {
                        console.log('page state: ', this.state.page_state)
                        console.log('asset state: ', assetState)
                        return (<div key={assetState.id}>{assetState.component}</div>)
                    })
                }
                <button onClick={this.savePage}>Save</button>
            </div>
        )
    }
}

class AddAsset extends React.Component {
    constructor (props) {
        super(props)
        this.addImageFromDisk = this.addImageFromDisk.bind(this)
        this.addImageFromUnsplash = this.addImageFromUnsplash.bind(this)
        this.addFileFromDisk = this.addFileFromDisk.bind(this)
        this.addYouTubeVideo = this.addYouTubeVideo.bind(this)
        this.addRichText = this.addRichText.bind(this)
    }

    addImageFromDisk() {

    }
    addImageFromUnsplash() {

    }
    addFileFromDisk() {

    }
    addYouTubeVideo() {

    }
    addRichText() {
        this.props.addAsset('rich text')
    }


    render() {
        // add image, add image to side
        // add image from free site
        // add youtube video
        // add code
        // add rich text
        // add link to images and text

        return (
            <div>
                <i className="fas fa-camera" onClick={this.addImageFromDisk}></i>
                <i className="fas fa-search" onClick={this.addImageFromUnsplash}></i>
                <i className="fas fa-folder-plus" onClick={this.addFileFromDisk}></i>
                <i className="fab fa-youtube" onClick={this.addYouTubeVideo}></i>
                <i className="fas fa-pen" onClick={this.addRichText}></i>
            </div>
        )
    }
} 


/*
This page may also have functionality to configure the nginx server and reload it 


component = (<RichText 
    assetState={assetState} 
    updateState={this.updateState} 
    delete={this.deleteAsset.bind(this, assetState.id)}
/>)

console.log(this.state.assets)
this.setState((state, props) => ({
    assets: [...state.assets, component]
}));

*/