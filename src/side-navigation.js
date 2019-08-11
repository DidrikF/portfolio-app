import React, { useState } from 'react';

export function UserInfo(user) {
    return (
        <div className="SN-UserInfo">
            <img className="SN-UserInfo__image" src={user.image} alt="Profile"/>
            <div className="SN-UserInfo__container">
                <div className="SN-UserInfo__username">{user.firstName}<span> {user.lastName}</span></div>
                <div className="SN-UserInfo__status">{user.description}</div>
            </div>
        </div>
    )
}

