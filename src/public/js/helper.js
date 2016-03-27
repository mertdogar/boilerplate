(function() {
    /**
     * Common helper class.
     */
    angular.module('panel').service('Helper', helper);


    /**
     * Dependencies.
     * @type {Array}
     */
    helper.$inject = [];


    /**
     * Definition.
     */
    function helper() {
        var Helper = {};


        /**
         * Gets error message from general err object.
         * @param {Object} err
         * @return {string}
         */
        Helper.getErrorMessage = function(err) {
            var message = 'Beklenmeyen bir hata meydana geldi, lütfen daha sonra tekrar deneyin.';

            if (!err || !err.data)
                return message;

            if (err.data.error)
                return err.data.error.message;

            // TODO: Bu kod hic calisiyor mu bilmiyorum, mevcut kod boyle
            // oldugu icin yine de tutayim dedim. Kullanilmiyorsa bunu sil.
            if (err.data.message)
                return err.data.message.errors.body.message;
        };


        return Helper;
    };
})();
