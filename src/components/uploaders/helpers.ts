import React from 'react';

export function updateWidth(this: React.Component) {
    const width = (window.innerWidth - 302) * 0.9

    this.setState({
        pageWidth: width
    })
}

export function setPageHeight(this: React.Component) {
    this.setState({
        pageHeight: document.documentElement.clientHeight
    })
}

export function setServerImageContainerWidth(this: React.Component, id: string) {
    const element = document.getElementById(id)
    if (element) {
        const containerWidth = element.offsetWidth
        this.setState({
            serverImageContainerWidth: containerWidth
        })
    }
}
