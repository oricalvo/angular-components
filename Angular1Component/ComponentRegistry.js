/// <reference path="f:\Projects\Angular1Component\Angular1Component\angular.js" />

(function (module) {
    function ComponentRegistry() {
        this.componentsDefs = {};
    }

    ComponentRegistry.prototype.registerDirectives = function () {
        for (var key in module._components) {
            var cdo = module._components[key];

            this.validate(cdo);

            this.componentsDefs[cdo.name] = cdo;

            this.registerDirective(cdo);
        }
    }

    ComponentRegistry.prototype.registerDirective = function (cdo) {
        var ComponentCompiler = module.ComponentCompiler;

        module.$compileProvider.directive(cdo.tag, function () {
            var ddo = {
                strict: "E",
                scope: {},
                compile: function (element, attrs) {
                    return function postLink(scope, element, attrs) {
                        ComponentCompiler.onPostLink(cdo, scope, element, attrs);
                    }
                },
                terminal: true,
            };

            return ddo;
        });
    }

    ComponentRegistry.prototype.validate = function (cdo) {
        if (!cdo.name) {
            throw new Error("Component must have a name");
        }

        if (!cdo.tag) {
            throw new Error("Component must have a tag");
        }

        if (!cdo.templateUrl) {
            throw new Error("Component must have a templateUrl");
        }

        if (!cdo.controller) {
            throw new Error("Component must have a controller");
        }

        if (typeof cdo.controller != "function") {
            throw new Error("Component controller must be a function");
        }

        if (!(cdo.controller.prototype instanceof module.Component)) {
            throw new Error("Component controller must derived from class Component");
        }

        if (!cdo.controllerAs) {
            throw new Error("Component must have a controllerAs");
        }

        if (!angular.isArray(cdo.inject)) {
            throw new Error("Component inject must be of array type");
        }
    }

    ComponentRegistry.prototype.getComponentDef = function (name) {
        var cdo = this.componentsDefs[name];

        if (!cdo) {
            throw new Error("Component " + name + " was not found");
        }

        return cdo;
    }

    module
        .service("componentRegistry", ComponentRegistry)
        .run(function (componentRegistry) {
            componentRegistry.registerDirectives();
        });
})(angular.module("ocComponents"));
