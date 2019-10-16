
import React from 'react';

// is editable

class ProjectCard extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            title: this.props.card.title,
            description: this.props.card.description,
            show: this.props.card.show,
            image: this.props.card.image,
            technologies: this.props.card.technologies,
        }
    }
    render() {
        // things are either an input or a span
        return (
            <div class="Portfolio__element">
                {this.state.title}
            </div>
        )
    }
}


function ResumeView () {

}




export default ProjectCard
/*
<div class="Portfolio__element">
    <h3 class="Portfolio__title"><a href="/portfolio/chatapp.html">Chat App</a></h3>
    <a href="/portfolio/chatapp.html">
        <img class="Portfolio__image" src="/images/chatapp_chat.PNG">
    </a>
    <div class="Portfolio__technologies">
        <div class="technology_logo">
            <img class="svg_logo" src="/logos/Node.js_logo.svg" alt="Node">
        </div>
        <div class="technology_logo">
            <a class="express_logo">Express</a>
        </div>
        <div class="technology_logo">
            <i class="fab fa-js-square"></i>
        </div>
        <div class="technology_logo">
            <img class="svg_logo" src="/logos/Vue.js_Logo.svg" alt="Vue">
        </div>
    </div>
</div>

<div class="Portfolio__element">
    <h3 class="Portfolio__title"><a href="/portfolio/codetube.html">Codetube - Youtube clone</a></h3>
    <a href="/portfolio/codetube.html">
        <img class="Portfolio__image" src="/images/codetube_frontpage.png">
    </a>
    <div class="Portfolio__technologies">
        <div class="technology_logo">
        <i class="fab fa-php"></i>
        </div>
        <div class="technology_logo">
        <img class="svg_logo" src="/logos/laravel_logo.svg" alt="Laravel">
        </div>
        <div class="technology_logo">
        <i class="fab fa-js-square"></i>
        </div>
        <div class="technology_logo">
        <img class="svg_logo" src="/logos/Vue.js_Logo.svg" alt="Vue">
        </div>
    </div>
</div>

<div class="Portfolio__element">
    <h3 class="Portfolio__title"><a href="/portfolio/ticketbeast.html">Ticketbeast - TDD course</a></h3>
    <a href="/portfolio/ticketbeast.html">
        <img class="Portfolio__image" src="/images/TicketBeast_frontpage.png">
    </a>
    <div class="Portfolio__technologies">
        <div class="technology_logo">
        <i class="fab fa-php"></i>
        </div>
        <div class="technology_logo">
        <img class="svg_logo" src="/logos/laravel_logo.svg" alt="Laravel">
        </div>
        <div class="technology_logo">
        <i class="fab fa-js-square"></i>
        </div>
        <div class="technology_logo">
        <img class="svg_logo" src="/logos/Vue.js_Logo.svg" alt="Vue">
        </div>
    </div>
</div>

<div class="Portfolio__element">
    <h3 class="Portfolio__title"><a href="/portfolio/multipaxos.html">Multi PAXOS</a></h3>
    <a href="/portfolio/multipaxos.html">
        <img class="Portfolio__image" src="/images/paxos_benchmark.png">
    </a>
    <div class="Portfolio__technologies">
        <div class="technology_logo">
        <img class="gopher_logo" src="/logos/gopher.png" alt="Go">
        </div>
        <div class="technology_logo">
        <i class="fab fa-js-square"></i>
        </div>
        <div class="technology_logo">
        <img class="svg_logo" src="/logos/Vue.js_Logo.svg" alt="Vue">
        </div>
    </div>
</div>


<div class="Portfolio__element">
    <h3 class="Portfolio__title"><a href="/portfolio/companywatchlist.html">Company Watchlist</a></h3>
    <a href="/portfolio/companywatchlist.html">
        <img class="Portfolio__image" src="/images/watchlist_frontpage.png">
    </a>
    <div class="Portfolio__technologies">
        <div class="technology_logo">
            <i class="fab fa-php"></i>
        </div>
        <div class="technology_logo">
            <img class="svg_logo" src="/logos/laravel_logo.svg" alt="Laravel">
        </div>
        <div class="technology_logo">
            <i class="fab fa-js-square"></i>
        </div>
        <div class="technology_logo">
            <img class="svg_logo" src="/logos/Vue.js_Logo.svg" alt="Vue">
        </div>
    </div>
    </div>

    <div class="Portfolio__element">
    <h3 class="Portfolio__title"><a href="/portfolio/didrikfleischer.html">didrikfleischer.com</a></h3>
    <a href="/portfolio/didrikfleischer.html">
        <img class="Portfolio__image" src="/images/didrikfleischer_frontpage.png" alt="DF">
    </a>
    <div class="Portfolio__technologies">
        
    </div>
</div>

*/