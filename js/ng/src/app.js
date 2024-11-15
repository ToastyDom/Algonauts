// Define AngularJS application
var momentsApp = angular.module('momentsApp', ['ngAnimate', 'angularGrid', 'ngMaterial'], function($interpolateProvider) {
        // var momentsApp = angular.module('momentsApp', [], function($interpolateProvider) {
        $interpolateProvider.startSymbol('{{');
        $interpolateProvider.endSymbol('}}');
    })
    .run(function($rootScope) {
        //   initialization
    })
    // .config(function($sceDelegateProvider) {
    // $sceDelegateProvider.resourceUrlWhitelist([
    .config(function($sceDelegateProvider, $compileProvider) {
        $sceDelegateProvider.resourceUrlWhitelist([
            'self',
            'http://data.csail.mit.edu/soundnet/actions3/**',
            'http://challenge.algonauts.csail.mit.edu/**'
        ]);
        $compileProvider.debugInfoEnabled(false);
    });