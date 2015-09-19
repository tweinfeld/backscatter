# backscatter
A Reactive library for Backbone

Backscatter is a small library that notifies you of changes _anywhere_ in your Backbone model tree, no matter how deep-nested they are. It's a great companion to React, since it enables you to carelessly trigger refreshes of your entire React tree whenever one or more base model(s) or their nested Models/Collections change.

## Installation

### NPM
```sh
npm install backscatter
```

## Types of events intercepted
Backscatter is a "catchall" listener. Anything that triggers an "all" event on your Model/Collection will be relayed by it.

## createFactory(BackboneClass) -> BackboneClass

If you already have custom Backbone models and collections defined in your projects, you can extend them using "createFactory" so they can be used by Backscatter.

## Backscatter.Model / Backscatter.Collection

An extension of Backbone's native Model and Collection which contains "**backscatterOn**" and "**backscatterOff**"

### backscatterOn(handler)

`handler` will be called whenever the Model/Collection `backscatterOn` is invoked on or any of its decendants (close or remote) trigger an 'all' event.

### backscatterOff(handler)

Removes the binding to `handler'. It's best to call this when the view hosting your react component dies.

## Example

```javascript
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
```
