import React from 'react'
import { BrowserRouter as Router, Route, Link, NavLink, HashRouter, Redirect } from "react-router-dom"; 
import { GlobalContext } from '../../contexts/GlobalContext'  


class ViewNav extends React.Component {

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
                                                    </Link>
                                                </li>
                                            )
                                        })
                                    }
                                    
                                </ul>
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
                                                        </Link>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        </div>
                    </React.Fragment>
                }
            </div>
        )
    }
}

ViewNav.contextType = GlobalContext;

export default ViewNav