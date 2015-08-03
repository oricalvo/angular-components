/// <reference path="f:\Projects\Angular1Component\Angular1Component\angular.js" />

(function (module) {

    var originalAngularModule = angular.module;
    var componentRegistry;

    angular.module = function () {
        var moduleInstance = originalAngularModule.apply(this, arguments);

        moduleInstance.component = function (name, cdo) {
            module._components = module._components || {};

            cdo.name = name;
            module._components[name] = cdo;
        }

        return moduleInstance;
    }

    module.createComponent = function (name) {
        var cdo = componentRegistry.getComponentDef(name);

        var component = Object.create(cdo.controller.prototype);

        cdo.inject.forEach(function (name) {
            component[name] = module.$injector.get(name);
        });

        module.$injector.invoke(cdo.controller, component, {});

        component.$componentDef = cdo;

        return component;
    }

    module.log = function(message) {
        //return;

        console.log(message);
    }

    module
        .config(function ($compileProvider) {
            module.$compileProvider = $compileProvider;
        })
        .run(["$injector", "componentRegistry", function ($injector, _componentRegistry) {
            module.$injector = $injector;
            componentRegistry = _componentRegistry;
        }]);


})(angular.module("ocComponents", []));
