panel
    .filter('fromNow', function () {
        return function (date) {
            if (!date) return '';

            return moment(date).fromNow();
        };
    });

panel
    .filter('specificDate', function() {
        return function(date) {
            if (!date) return '';

            return moment(date).format('LLL');
        };
    })
