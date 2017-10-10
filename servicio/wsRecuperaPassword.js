//const User = require('../app/models/user');
const config = require('../config/main');
const Model = require('../db/model');
const email = require('../config/emailServer');
const Hash = require('hashids');
const moment = require("moment");
const pug = require('pug');

module.exports = function (req, res) {

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log(req.body);

	if (!req.body.email) {
		return res.status(400).json({ success: false, code: 1210, message: 'Falta email.' });
	}

	var hashId = new Hash(config.secret),
		tempPassword = hashId.encode(parseInt(Math.random() * 10e10)),
		encodedPassword = config.encripta(tempPassword);

	const cEmailBody = pug.compileFile('views/emailRecuperaPassword.pug');

	new Model.Usuario({ cEmail: req.body.email })
		.fetch()
		.then(function (data) {
			if (data !== null) {
				this.where({ cEmail: req.body.email })
					.save({ cPassword: encodedPassword }, { method: 'update' }, { patch: true })
					.then(function (data) {
						var toMail = req.body.email;
						if (process.env.WSAPI_AMBIENTE != 'PROD') {
							// toMail = 'andres.galaz@snapcar.com.ar';
							toMail = 'rodrigo.sobrero@snapcar.com.ar';
						}

						email.server.send({
							from: 'SnapCar Integrity <no-responder@snapcar.com.ar>',
							to: toMail,
							subject: 'Nueva contraseña',
							attachment: [{
								data: cEmailBody({
									nuevoPassword: tempPassword,
 									// baseUrl: req.protocol + '://' + req.headers.host
                                                                        baseUrl: 'https://api.appcar.com.ar'
								}),
								alternative: true
							}]
						}, function (err, message) {
							if(err)
               					console.log(err);
						});
					});
					res.status(201).json({ success: true, message: 'Correo electrónico enviado' });
			} else {
				res.status(400).json({ success: false, code: 1220, message: 'Cuenta no existe' });
			}
		});
};
