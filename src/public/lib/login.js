(function(API_URL, SITE_URL) {
    var config = {
            "meta": {
                "title": "Düşle Beşiktaş"
            },
            "root": {
                "apiUrl": API_URL,
                "api": API_URL,
                "static": API_URL
            },
            "loginUrl": "/login.html",
            "dashboardUrl": "/"
        },
        $form = $('.ui.form'),
        $button = $form.find('.submit.button');

    // Todo: Update config for prod.

    $form.form({
        fields: {
            email: {
                identifier: 'email',
                rules: [
                    {
                        type: 'empty',
                        prompt: 'Please enter your e-mail'
                    },
                    {
                        type: 'email',
                        prompt: 'Please enter a valid e-mail'
                    }
                ]
            },
            password: {
                identifier: 'password',
                rules: [
                    {
                        type: 'empty',
                        prompt: 'Please enter your password'
                    }
                ]
            }
        }
    });

    $form.submit(function() {
        var isValid = $form.form('is valid');

        if (!isValid)
            return false;

        $form.removeClass('error');
        $button.addClass('loading');

        $
            .post(config.root.api + '/users/login', $form.serialize())
            .done(function(data) {
                var ref = localStorage.getItem('loginRef');

                if (ref) {
                    localStorage.removeItem('loginRef');
                    return window.location.href = ref;
                }

                window.location.href = '/admin';
            })
            .fail(function(XMLHttpRequest) {
                $button.removeClass('loading');

                var message = 'Bağlantı hatası. Lütfen tekrar deneyiniz.';

                if (XMLHttpRequest.status == 404)
                    message = 'Kullanıcı adı veya şifre yanlış.';

                $form
                    .addClass('error')
                    .find('.error.message')
                    .text(message);
            });

        return false;
    });
})(API_URL, SITE_URL);
