panel.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider.
        when('/', {
            templateUrl: '/public/components/home/view.html',
            controller: 'HomeController'
        }).
        otherwise({
            redirectTo: '/'
        });

        // use the HTML5 History API
        $locationProvider.html5Mode(true);
}]);
