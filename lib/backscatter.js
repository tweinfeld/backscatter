"use strict";

(function(factory){

    if(typeof define === 'function' && define.amd){
        define(["underscore", "backbone"], factory);
    } else if (typeof exports !== 'undefined'){
        module.exports = factory(require('underscore'), require('backbone'));
    } else {
        window["Backscatter"] = factory(window["_"], window["Backbone"]);
    }

})(function(_, Backbone){

    var exports = {},
        dispatchers = [],
        sink = function(){
            var args = _.toArray(arguments);
            dispatchers.forEach(function(dispatcher){
                // Each dispatcher is deferred
                _.defer(function(){
                    dispatcher.apply(undefined, args);
                });
            });
        };

    var validateAncestry = function(root, target){
        return (function scan(current){
            return current === target ||
                (
                    [Backbone.Model, Backbone.Collection].reduce(function(ac, cls){ return ac || (current instanceof cls); }, false) &&
                    !!~(current.models || current.values()).map(scan).indexOf(true)
                );
        })(root);
    };

    exports["createFactory"] = function(SourceEntity){
        return SourceEntity.extend({
            initialize: function(){
                // Hook for all event, rely them to "sink" to deliver to all registered observers
                this.on('all', _.partial(sink, this));

                // Call "initialize" on the source entity
                SourceEntity.prototype.initialize.call(this);
            },
            backscatterOn: function(handler){
                var _this = this,
                    wrapper = function(target){
                        // Validate if the ancestry chain is valid
                        validateAncestry(_this, target) && handler.apply(undefined, _.toArray(arguments))
                    };

                wrapper._handler = handler;
                dispatchers.push(wrapper);
            },
            backscatterOff: function(handler){
                var index = _.pluck(dispatchers, '_handler').indexOf(handler);
                dispatchers.splice(index, ~index ? 1 : 0);
            }
        });
    };

    return _.extend(exports, {
        Model: exports["createFactory"](Backbone.Model),
        Collection: exports["createFactory"](Backbone.Collection)
    });

});