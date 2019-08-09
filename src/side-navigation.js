import React from 'react';

export function UserInfo(user) {
    return (
        <div className="SN-UserInfo">
            <img className="SN-UserInfo__image" src="http://via.placeholder.com/42x42"/>
            <div className="SN-UserInfo__container">
                <div className="SN-UserInfo__username">{user.firstName}<span> {user.lastName}</span></div>
                <div className="SN-UserInfo__status">{user.description}</div>
            </div>
        </div>
    )
}


export function AccountInfo() {
    return (
        <div id="SN__account-info" className="SN__container">
            <p className="SN__menu-title">ACCOUNT</p>
            <div className='SN__widget'> {/* Section__toolbarMenu */}
                <ul>
                    <li><a className="SN__item" onClick={()=>{}}><i className="material-icons">add_box</i><span>Log In</span></a></li>
                </ul>
            </div>
        </div>
    )
}