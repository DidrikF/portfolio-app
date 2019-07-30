import React from 'react';


export default class Resume extends React.Component {
    
    render() {
        return (
            <div className="Resume">
                <a name="cv"></a>
                <h2 className="Section__title">CV</h2>
                <p className="Resume__paragraph">Interested in my CV? You can download it using the button below.</p>
                <a className="Resume__button" href="/files/Didrik Fleischer CV - BSc in Telematics and MSc student in Industrial Economics (Comp.Sci + Investing and Finance) - 23.09.2018.pdf" download>Download my CV</a>
            </div>
        )
    }
}

