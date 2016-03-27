(function() {
    /**
     * Environment configuration
     */
    angular.module('panel').constant('config', __ENV_CONFIG__);


    /**
     * Configure.
     */
    angular.module('panel').config(configure);


    /**
     * Dependencies.
     * @type {Array}
     */
    configure.$inject = ['$provide', '$httpProvider'];


    /**
     * Main configure method.
     */
    function configure($provide, $httpProvider) {
        moment.locale('tr');
        $httpProvider.defaults.withCredentials = true;
    };
})();
