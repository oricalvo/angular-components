/// <reference path="f:\Projects\Angular1Component\Angular1Component\angular.js" />

(function (module) {
    "use strict";

    function Component() {
        profiler.mark(this, Component);
    }

    Component.prototype.onDestroy = function () {
        module.log("onDestroy:" + this.$componentDef.name);

        this.$parent._onComponentRemoved(this);
    }

    Component.prototype.addComponent = function (component) {
        var me = this;

        component._onAdding(me);

        var compiler = module.ComponentCompiler.create();
        compiler.compile(me, component).then(function () {
            me.$element.append(component.$element);

            component._onAdded(me);
        });
    }

    Component.prototype._onAdding = function (parent) {
        if (this.$parent) {
            throw new Error("Component was already added to another parent");
        }
    }

    Component.prototype._onAdded = function (parent) {
        this.$parent = parent;
    }

    Component.prototype._onComponentCreated = function (component) {
        this.$components.push(component);
    }

    Component.prototype._onComponentRemoved = function (component) {
        var index = -1;

        for (var i = 0; i < this.$components.length; i++) {
            if (this.$components[i] == component) {
                index = i;
                break;
            }
        }

        if (index != -1) {
            this.$components.splice(index, 1);

            module.log("onComponentRemoved:" + this.$componentDef.name + "(" + this.$components.length + ")");
        }
    }

    Component.prototype.clearComponents = function () {
        //
        //  PERF: Each child component being destroyed causes a search inside the $components
        //

        //
        //  Need to copy aside since the collection is modified during iteration
        //
        var components = [].concat(this.$components);

        components.forEach(function (component) {
            component.$scope.$destroy();
        });

        components.forEach(function (component) {
            component.$element.remove();
        });

        //this.$components.splice(0, this.$components.length);
    }

    module.Component = angular.Component = Component;
})(angular.module("ocComponents"));
