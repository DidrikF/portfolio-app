import React from 'react';


export type UserInfoProps = {
    user: Partial<import("../../../types/platform_types").User>,
    id: string
}

export function UserInfo(props: UserInfoProps) {
    const { user, id } = props;
    return (
        <div id={id}>
            <img className="SN-UserInfo__image" src={user.image} alt="Profile"/>
            <div className="SN-UserInfo__container">
                <div className="SN-UserInfo__username">{user.firstName}<span> {user.lastName}</span></div>
                <div className="SN-UserInfo__status">{user.description}</div>
            </div>
        </div>
    )
}
