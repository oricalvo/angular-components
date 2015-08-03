//(function (Component) {
var Component = angular.Component;

    function ComplexComponent() {
        Component.call(this);

        this.nums = [1, 2, 3];
    }

    ComplexComponent.prototype = Object.create(Component.prototype);

    angular.module("MyApp").component("Complex", {
        tag: "complex",
        templateUrl: "Complex.html",
        controller: ComplexComponent,
        controllerAs: "ctrl",
        inject: [],
    });

    //window.ComplexComponent = ComplexComponent;
//})(angular.Component);
