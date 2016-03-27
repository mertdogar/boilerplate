panel
    .filter('simpleDate', function () {
        return function (date) {
            if (!date) return '';

            return moment(date).format('LL');
        };
    });
