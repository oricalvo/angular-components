/// <reference path="f:\Projects\Angular1Component\Angular1Component\angular.js" />

(function (module) {
    "use strict";

    var log = module.log;

    function ComponentCompiler($compile, $http, $q, $parse) {
        this.$compile = $compile;
        this.$http = $http;
        this.$q = $q;
        this.$parse = $parse;

        this.compiling = 0;
        this.compiled = 0;
        this.stack = [];
        this.compileDoneDeferred = $q.defer();
        this.rootComponent = null;
    }

    ComponentCompiler.onPostLink = function (cdo, scope, element, attrs) {
        var componentCompiler = element.inheritedData("componentCompiler");
        if (!componentCompiler) {
            componentCompiler = ComponentCompiler.create();
            element.data("componentCompiler", componentCompiler);
        }

        componentCompiler._postLink(cdo, scope, element, attrs);
    }

    ComponentCompiler.create = function () {
        return module.$injector.instantiate(ComponentCompiler);
    }

    ComponentCompiler.prototype.compile = function (parent, component) {
        var element = angular.element("<" + component.$componentDef.tag + " />");
        this.rootComponent = component;

        element.data("componentCompiler", this);

        this.$compile(element)(parent.$scope);

        return this.compileDoneDeferred.promise;
    }

    function CompilerEntry(cdo) {
        angular.extend(this, cdo);
    }

    ComponentCompiler.prototype._postLink = function (cdo, scope, element, attrs) {
        var ce = new CompilerEntry(cdo);

        ce.element = element;
        ce.attrs = attrs;
        ce.onInit = [];
        ce.children = [];
        ce.scope = scope;
        ce.element = element;
        ce.attrs = attrs;
        ce.var = ce.attrs.var || "";
        ce.parent = scope.$parent.ce;
        ce.cdo = cdo;
        ce.scope.ce = ce;

        if (this.stack.length == 0) {
            log("compileBegin:" + ce.name);
        }

        this.prepareComponent(ce);
    }

    ComponentCompiler.prototype.prepareComponent = function (ce) {
        var me = this;

        log("prepare:" + ce.name);

        me.stack.push(ce);

        ++me.compiling;

        me.$http.get(ce.templateUrl).then(function (res) {
            ce.element.append(res.data);

            var linkFn = me.$compile(ce.element.children());
            linkFn(ce.scope);

            if (++me.compiled == me.compiling) {
                me.onCompileDone();
            }
        });
    }

    ComponentCompiler.prototype.onCompileDone = function () {
        var me = this;

        this.stack.forEach(function (ce) {
            me.createComponent(ce);
        });

        for (var i = me.stack.length - 1; i >= 0; i--) {
            var childCe = me.stack[i];

            me.constructComponent(childCe);
        }

        var top = me.stack[0];

        me.initComponent(top).then(function () {
            me.compileDoneDeferred.resolve(top.component);

            log("compileDone:" + top.name);
        });

        for (var i = me.stack.length - 1; i >= 0; i--) {
            var ce = me.stack[i];
            //ce.scope.ce = null;
        }

        top.element.removeData("componentCompiler");
        me.stack.splice(0, me.stack.length);
    }

    ComponentCompiler.prototype.createComponent = function (ce) {
        var me = this;

        log("createComponent:" + ce.name);

        var component;
        if (ce == this.stack[0] && this.rootComponent) {
            //
            //  Don't re-create root component
            //
            component = ce.component = this.rootComponent;
        }
        else {
            component = ce.component = Object.create(ce.controller.prototype);

            ce.inject.forEach(function (name) {
                component[name] = module.$injector.get(name);
            });
        }

        component.$element = ce.element;
        component.$scope = ce.scope;
        component.$components = [];
        component.$parent = (ce.parent ? ce.parent.component : null);
        component.$componentDef = ce.cdo;

        ce.scope[ce.controllerAs] = component;

        ce.scope.$on("$destroy", function () {
            log("destroyComponent:" + component.$componentDef.name);

            component.onDestroy();
        });

        if (ce.parent) {
            ce.parent.children.push(ce);
        }

        var varName = ce.var;
        if (ce.parent && varName) {
            var getter = me.$parse(varName);
            var setter = getter.assign;
            if (!setter) {
                throw new Error("Expression " + varName + " is not assignable");
            }

            setter(ce.parent.scope, component);
        }
    }

    ComponentCompiler.prototype.constructComponent = function (ce) {
        log("constructComponent:" + ce.name);

        if (ce == this.stack[0] && this.rootComponent) {
            //
            //  Don't re-construct root component
            //
        }
        else {
            ce.controller.call(ce.component);
        }

        var parentComponent = (ce.parent ? ce.parent.component : null);
        if (parentComponent) {
            parentComponent._onComponentCreated(ce.component);

            log("addComponent:" + ce.name + "-->" + ce.parent.name + "(" + parentComponent.$components.length + ")");
        }
    }

    ComponentCompiler.prototype.initComponent = function (ce) {
        var promises = [];

        ce.children.forEach(function (ce) {
            if (ce.component.onInit) {
                var promise = initComponent(ce);
                promises.push(promise);
            }
        });

        return this.$q.all(promises).then(function () {
            if (ce.component.onInit) {
                log("initComponent:" + ce.name);

                var promise = ce.component.onInit();
                return promise;
            }
        });
    }

    module.ComponentCompiler = ComponentCompiler;
})(angular.module("ocComponents"));
