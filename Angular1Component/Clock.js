(function (Component) {

    function ClockComponent() {
        var me = this;

        profiler.mark(this, ClockComponent);

        Component.call(me);

        me.time = new Date();
        me.intervalId = this.$interval(function () {
            me.time = new Date();
        }, 1000);
    }

    ClockComponent.prototype = Object.create(Component.prototype);

    ClockComponent.prototype.onInit = function () {
    }

    ClockComponent.prototype.stop = function () {
        this.$interval.cancel(this.intervalId);
    }

    angular.module("MyApp").component("Clock", {
        tag: "clock",
        templateUrl: "Clock.html",
        controller: ClockComponent,
        controllerAs: "ctrl",
        inject: ["$interval"],
    });
})(angular.Component);
