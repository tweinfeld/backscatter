import _ from 'underscore';
import Backscatter from './lib/backscatter.js';
import React from 'react';

class MyCustomComponent extends React.Component {
    render(){
        return <div>{ this.props.title }</div>
    }
}

let A = new Backscatter.Model({ "title": `Hello World!` }),
    B = new Backscatter.Model(),
    C = new Backscatter.Model({ "a": A, "b": B }),
    D = new Backscatter.Collection([C]);

let renderComponent = function(){
    React.render(React.createElement(MyCustomComponent, { title: D.at(0).get('a').get('title') }), document.querySelector('body'));
};

// Set backscatter to render your component whenever there are changes to your model
D.backscatterOn(_.debounce(function(...[target, name]){
    console.log(`We've got a change on ${target.cid} with event name ${name}`)
    renderComponent();
}));

// Perform a change somewhere in your model, and let backscatter react
setTimeout(function(){
    // Let's touch our model somewhere in a deep nested location
    A.set({ "title": `Here!` })
}, 1000);

renderComponent();