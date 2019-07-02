import React from 'react' 

export default class Footer extends React.Component {
    render() {
        return (
            <footer className="Footer">
                <p className="Footer__thanks">Thank you for taking a look!</p>

                <nav className="Footer__navigation">
                    <ul className="Navigation__list">
                        <li className="Navigation__element"><a href="#home">HOME</a></li>
                        <li className="Navigation__element"><a href="#about">ABOUT</a></li>
                        <li className="Navigation__element"><a href="#portfolio">PORTFOLIO</a></li>
                        <li className="Navigation__element"><a href="#cv">CV</a></li>
                        <li className="Navigation__element"><a href="#contact">CONTACT</a></li>
                    </ul>
                </nav>

                <p className="Footer__createdby">Created by Didrik Fleischer</p>

                <div className="Footer__links">
                    <a target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/didrik.fleischer"><i className="fab fa-facebook-square"></i></a>
                    <a target="_blank" rel="noopener noreferrer" href="https://www.linkedin.com/in/didrik-fleischer-a6623533/"><i className="fab fa-linkedin"></i></a>
                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/DidrikF"><i className="fab fa-github-square"></i></a>
                    <a target="_blank" rel="noopener noreferrer" href="https://twitter.com/FleischerDidrik"><i className="fab fa-twitter-square"></i></a>
                </div>

            </footer>
        )
    }
}
