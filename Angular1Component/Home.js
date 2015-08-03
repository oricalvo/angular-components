(function () {
    var ocComponents = angular.module("ocComponents");
    var Component = ocComponents.Component;

    function HomeComponent() {
        Component.call(this);

        profiler.mark(this, HomeComponent);

        this.data = 10;
    }

    HomeComponent.prototype = Object.create(Component.prototype);

    HomeComponent.prototype.onInit = function () {
    }

    HomeComponent.prototype.run = function () {
    }

    HomeComponent.prototype.create = function () {

        var clock = ocComponents.createComponent("Clock");

        this.addComponent(clock);
    }

    HomeComponent.prototype.clear = function () {
        this.clearComponents();
    }

    angular.module("MyApp").component("Home", {
        tag: "home",
        templateUrl: "Home.html",
        controller: HomeComponent,
        controllerAs: "ctrl",
        inject: ["$http"],
    });
})();
