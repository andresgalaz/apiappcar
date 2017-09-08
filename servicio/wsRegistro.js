const Model = require('../db/model');
const config = require('../config/main');
const email = require('../config/emailServer');
const moment = require("moment");
const pug = require('pug');
const Hash = require('hashids');

module.exports = function(req, res) {
    const Util = require('../util');

    // Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    // La password se encripta antes de desplegar en la bitácora
    req.body.password = config.encripta(req.body.password);

    console.log(req.body);
    if (!req.body.email) {
        return res.status(400).json({ success: false, code: 1310, message: 'Falta email.' });
    }
    if (!req.body.password && !req.body.google && !req.body.facebook) {
        return res.status(400).json({ success: false, code: 1320, message: 'Falta password.' });
    }
    new Model.UsuarioVeh({ cEmail: req.body.email }).fetch({ withRelated: ['vehiculos'] }).then(function(data) {
        try {
            var pUsuario = null;
            if (data !== null) {
                var user = data.toJSON();
                pUsuario = user.pUsuario;
                if (user.bConfirmado == '1') {
                    return res.status(400).json({ success: false, code: 1322, message: 'El usuario ya está registrado.' });
                }
            }
            // No existe y se crea el usuario
            if (!req.body.nombre) {
                return res.status(400).json({ success: false, code: 1330, message: 'Falta nombre.' });
            }
            if (!req.body.dni) {
                return res.status(400).json({ success: false, code: 1330, message: 'Falta DNI.' });
            } else if (!Util.esDni(req.body.dni)) {
                return res.status(400).json({ success: false, code: 1332, message: 'Número de DNI incorrecto.' });
            }
            if (req.body.sexo && !Util.esSexo(req.body.sexo)) {
                return res.status(400).json({ success: false, code: 1340, message: 'Tipo sexo incorrecto.' });
            }
            if (req.body.fechaNacimiento && !Util.esFecha(req.body.fechaNacimiento)) {
                return res.status(400).json({ success: false, code: 1350, message: 'Fecha de nacimiento incorrecta.' });
            }

            if (pUsuario) {
                new Model.Usuario().where({ pUsuario: pUsuario }).save({
                    cEmail: req.body.email,
                    cPassword: req.body.password,
                    cNombre: req.body.nombre,
                    nDni: req.body.dni,
                    cSexo: req.body.sexo,
                    dNacimiento: req.body.fechaNacimiento,
                    bConfirmado: '0'
                }, {
                    method: 'update'
                }, {
                    patch: true
                }).then(function(data) {
                    user = data.toJSON();
                    user.success = false;
                    user.message = 'Se le ha enviado un mail. Cofirme el mail para ingresar';
                    return res.status(400).json(user);
                });
            } else {
                var hashId = new Hash(config.secret);

                new Model.Usuario({
                    cEmail: req.body.email,
                    cPassword: req.body.password,
                    cNombre: req.body.nombre,
                    nDni: req.body.dni,
                    cSexo: req.body.sexo,
                    dNacimiento: req.body.fechaNacimiento,
                    bConfirmado: '0'
                }).save().then(function(dataIns) {
                    var user = dataIns.toJSON();
                    new Model.UsuarioVeh({ pUsuario: user.pUsuario }).fetch({ withRelated: ['vehiculos'] }).then(function(data) {
                        user = data.toJSON();
                        var usrOut = Model.UsuarioVeh.salida(user);
						usrOut.success = true;
						usrOut.message ='Se le ha enviado un mail. Cofirme el mail para ingresar';
						return res.status(201).json(usrOut);
                    });

                    const cEmailBody = pug.compileFile('views/emailRegistro.pug');
                    var idRegistro = hashId.encode(1e11 + user.pUsuario);
					var toMail = [req.body.email];
                    var linkUrl = 'https://desa.snapcar.com.ar/wappTest'
                    var baseUrl = 'https://test.appcar.com.ar/'
					if (process.env.WSAPI_AMBIENTE == 'PROD') {
                    	linkUrl = 'https://crm.snapcar.com.ar/wappCar'
                    	baseUrl = 'https://api.appcar.com.ar/'
					}
					linkUrl += '/do/cli/login/registro.vm';
                    email.server.send({
                        from: 'SnapCar <no-responder@snapcar.com.ar>',
                        to: toMail,
                        subject: 'Confirme su registro',
                        attachment: [{
                            data: cEmailBody({
                                nombreUsuario: req.body.nombre.split(' ')[0],
                                idRegistro: idRegistro,
                                emailRegistro: req.body.email,
                                baseUrl: baseUrl,
                                linkUrl: linkUrl
                            }),
                            alternative: true
                        }]
                    }, function(err, message) {
                        console.log(err || message);
                    });
                });
            }
        } catch (e) {
            console.log(e);
            return res.status(401).json({
                success: false,
                code: 1360,
                message: 'Error inesperado.'
            });
        }
    });
};
