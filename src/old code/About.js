import React from 'react';


export default class About extends React.Component {
    
    render() {
        return (
            <div className="About">
                <a name="about"></a>
                <h2 className="Section__title">About</h2>
                <p className="About__paragraph Text__container">
                    Hi, my name is Didrik Fleisher and welcome to my personal home page. I’m a graduate student at the University of Stavanger,
                    studying industrial economics (computer science + investing and finance). This website was created for me to share my work and
                    accomplishments with potential employers and others.
                </p>
                
                <div className="row">
                    <section className="column">
                        <h3 className="About__heading">Education</h3>
                        <p className="About__paragraph">
                            2011-2014: Bachelor’s degree in telematics at the Norwegian Defence Cyber Academy
                            <br></br>
                            <br></br>
                            2015-2019: Master of Science in Industrial Economics at the University of Stavanger
                        </p>
                    </section>
                    
                    <section className="column">
                        <h3 className="About__heading">Experience</h3>
                        <p className="About__paragraph">
                            2014-2017: Lan Technician at NATO Communication and Information Agency<br></br><br></br>

                            2015: Awarded Cisco Certified Network Associate - Routing and Switching<br></br><br></br>
                            
                            2015: Awarded Cisco Certified Network Professional - Routing and Switching<br></br><br></br>
                            
                            2016: Attended CCNA Wireless course with Global Knowledge
                            
                        </p>
                    </section>
                    
                    <section className="column">
                        <h3 className="About__heading">Interests</h3>
                        <p className="About__paragraph">
                            Nothing has yet captured my interest like software development. The combination of creativity and application rigorous logic fascinates me deeply.
                            My main interest is in web development, but I’m also familiar with Golang and Python. 
                            <br></br><br></br>
                            Lately I’ve also taken up machine learning, hoping to be able to apply it to the field of security valuation.
                            
                        </p>
                    </section>
                </div>
            </div>
        )
    }
}