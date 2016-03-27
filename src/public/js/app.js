var panel = angular
    .module('panel', [
        'ngRoute',
        'ngSanitize',
        'ngResource'
    ])
    .constant('_', _)
    .run(function($rootScope) {
        console.log('RootScope initialized.');
    });
