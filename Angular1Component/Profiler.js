/// <reference path="f:\Projects\Angular1Component\Angular1Component\angular.js" />

var profiler = (function (module) {
    "use strict";

    var markers = {};

    function createClass(name) {
        var res;
        var body = "res = function " + name + "(){};";
        eval(body);
        return res;
    }

    return {
        mark: function (obj, ctor) {
            var marker = markers[ctor.name];
            if (!marker) {
                marker = markers[ctor.name] = createClass(ctor.name + "$$profiler");
            }

            obj.$$profileId = new marker();
        }
    };
})();
