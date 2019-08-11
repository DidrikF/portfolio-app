import React from 'react'
import { BrowserRouter as Router, Route, Link, NavLink, HashRouter, Redirect } from "react-router-dom"; 
import ColorManager from './ColorManager'
import { GlobalContext } from './contexts'  

/* Need
state.scrollableHeight
state.pages
toggleEdit
deletePage
createPage

clearFocus
toggleSpacing
addSection

addComponent

// State can be moved to this component...
state.newPageTitle // simply add arguments to the createPage method
changePageTitle

state.newProjectTitle
changePageTitle

*/

class AuthNav extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            newPageTitle: "",
            newProjectTitle: "",
        }

        this.changeProjectTitle = this.changeProjectTitle.bind(this)
        this.changePageTitle = this.changePageTitle.bind(this)
    }

    changePageTitle(e) {
        this.setState({
            newPageTitle: e.target.value,
        })
    }

    // Create new projects in the side navigation
    changeProjectTitle(e) {
        this.setState({
            newProjectTitle: e.target.value
        })
    }

    render () {
        return (
            <div className="SN-Scrollable" style={{
                height: this.props.scrollableHeight
            }}>

                { !this.context.editing &&
                    <React.Fragment>
                        <div className="SN__container">
                            <p className="SN__menu-title">PAGES</p>
                            <div className='SN__widget'>
                                <ul>
                                    {
                                        this.props.pages.map((page, pageIndex) => {
                                            if (page.type !== "page") {
                                                return null
                                            }
                                            return (
                                                <li key={page.id}>
                                                    <Link
                                                        to={page.path} 
                                                        className="SN__item"
                                                        activeClassName="SN__item--active"
                                                        onlyActiveOnIndex
                                                    >
                                                        <i className="material-icons">pages</i><span>{page.title + " "}</span>
                                                        <button className="SN__button SN__edit-button" onClick={this.props.toggleEdit} value={pageIndex}>
                                                            <i className="material-icons">edit</i>
                                                        </button>
                                                        <button className="SN__button SN__delete-button" onClick={() => {this.props.deletePage(pageIndex)}}>
                                                            <i className="material-icons">delete</i>
                                                        </button>
                                                    </Link>
                                                </li>
                                            )
                                        })
                                    }
                                    
                                </ul>
                                <div>
                                    <input className="SN__input" placeholder="Page Title" value={this.state.newPageTitle} onChange={this.changePageTitle}/>
                                    <button className="SN__button SN__add-button" onClick={() => this.props.createPage("page", this.state.newPageTitle)}>
                                        <i className="material-icons">add_box</i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="SN__container">
                            <p className="SN__menu-title">PROJECTS</p>
                            <div className="SN__widget">
                                <ul>
                                    {
                                        this.props.pages.map((page, pageIndex) => {
                                            if (page.type !== 'project') {
                                                return null
                                            }
                                            return (
                                                <li key={page.id}>
                                                        <Link 
                                                            to={page.path} 
                                                            className="SN__item"
                                                            activeClassName="SN__item--active" // not working, do not know why
                                                            onlyActiveOnIndex
                                                        >
                                                            <i className="material-icons">pages</i><span>{page.title}</span>
                                                            <button className="SN__button SN__edit-button" onClick={this.props.toggleEdit} value={pageIndex}>
                                                                <i className="material-icons">edit</i>
                                                            </button>
                                                            <button className="SN__button SN__delete-button" onClick={() => {this.props.deletePage(pageIndex)}}>
                                                                <i className="material-icons">delete</i>
                                                            </button>
                                                        </Link>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                                <div>
                                    <input className="SN__input" placeholder="Project Title"  value={this.state.newProjectTitle} onChange={this.changeProjectTitle}/>
                                    <button className="SN__button SN__add-button" onClick={() => this.props.createPage("project", this.state.newProjectTitle)}>
                                        <i className="material-icons">add_box</i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                }
            


                { this.context.editing && 
                    <React.Fragment>
                        <div className="SN__container">
                            <div className='SN__widget'>
                                <i className="material-icons SN__back-arrow" onClick={this.props.toggleEdit}>arrow_back</i>
                            </div>
                        </div>
                        <div className="SN__container">
                            <p className="SN__menu-title">GLOBAL</p>
                            <div className='SN__widget'> {/* Section__toolbarMenu */}
                                <ul>
                                    <li><a className="SN__item SN__item--green" onClick={this.props.saveActivePage}><i className="material-icons">save</i><span>Save Active Page</span></a></li>
                                    <li><a className="SN__item" onClick={this.props.clearFocus}><i className="material-icons">clear</i><span>Clear Focus</span></a></li>
                                    <li><a className="SN__item" onClick={this.props.toggleSpacing}><i className="material-icons">border_all</i><span>Toggle Spacing</span></a></li>
                                    <li><a className="SN__item" onClick={(e) => this.props.addSection()}><i className="material-icons">add_box</i><span>Add Section</span></a></li>                                                  
                                </ul>
                            </div>
                        </div>
                    </React.Fragment>
                }

                <div id="Page__toolbar-portal"></div>
                    
                { this.context.editing && 
                    <React.Fragment>
                        <ColorManager flashMessage={this.context.flashMessage}/>

                        <div className="SN__container">
                            <p className="SN__menu-title">COMPONENTS</p>
                            <div className='SN__widget'> {/* Section__toolbarMenu */}
                                <ul>
                                    <li><a className="SN__item" onClick={() => this.props.addComponent("rich text")}><i className="material-icons">text_fields</i><span>Add Rich Text</span></a></li>
                                    <li><a className="SN__item" onClick={() => this.props.addComponent("image")}><i className="material-icons">insert_photo</i> <span>Add Image</span></a></li>
                                </ul>
                            </div>
                        </div>  
                        <div className="SN__container">
                            <p className="SN__menu-title">FILES</p>
                            <div className='SN__widget'> {/* Section__toolbarMenu */}
                                <ul>
                                    <li>          
                                        <Link 
                                            to={{
                                                pathname: '/image-uploader',  
                                            }} 
                                            className="SN__item"
                                            activeClassName="SN__item--active" // not working, do not know why
                                            >
                                            <i className="material-icons">cloud_upload</i><span>Image Uploader</span>
                                        </Link>
                                    </li>
                                    <li>          
                                        <Link 
                                            to={{
                                                pathname: '/file-uploader',  
                                            }} 
                                            className="SN__item"
                                            activeClassName="SN__item--active" // not working, do not know why
                                            >
                                            <i className="material-icons">cloud_upload</i><span>File Uploader</span>
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>  
                    </React.Fragment>
                }

            </div>
        )
    }
}

AuthNav.contextType = GlobalContext;


export default AuthNav