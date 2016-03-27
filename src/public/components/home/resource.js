panel.factory('Home', ['$resource', function ($resource) {
    return $resource('/api/home', {}, {
        'query': {isArray: false}
    });
}]);
