import _ from 'underscore';
import Backbone from 'backbone';
import Backscatter from './lib/backscatter.js';
import React from 'react';

class MyCustomComponent extends React.Component {
    render(){
        return <div>{ this.props.title }, { this.props.name }</div>
    }
}

// This model is an example of an existing model that's extended to enable backscatter updates (see "createFactory")
let MyExistingModel = Backbone.Model.extend({ defaults: { id: "name", name: "John Doe" } });

let A = new Backscatter.Model({ id: "title", "title": `Howdy` }),
    B = new (Backscatter.createFactory(MyExistingModel)),
    C = new Backscatter.Model({ "a": A, "b": B }),
    D = new Backscatter.Collection([C]);

let renderComponent = function(){
    React.render(React.createElement(MyCustomComponent, { title: D.at(0).get('a').get('title'), name: D.at(0).get('b').get('name') }), document.querySelector('body'));
};

// Set backscatter to render your component whenever there are changes to your model
D.backscatterOn(_.debounce(function(...[target, name]){
    console.log(`We've got a change on "${target.id}" with event name "${name}"`)
    renderComponent();
}));

// Perform a change somewhere in your model, and let backscatter react
setTimeout(function(){
    // Let's touch our model somewhere in a deep nested location
    A.set({ "title": `Hello` })
}, 1000);

setTimeout(function(){
    // Let's touch our model somewhere else in a deep nested location
    B.set({ "name": `Mark Smith` })
}, 2000);

renderComponent();