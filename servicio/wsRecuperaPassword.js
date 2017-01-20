//const User = require('../app/models/user');
const config = require('../config/main');
const Model = require('../db/model');
const moment = require("moment");

module.exports = function (req, res) {

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log(req.body);
	if (!req.body.email) {
		return res.status(400).json({ success: false, code: 1210, message: 'Falta email.' });
	}
	new Model.Usuario({ cEmail: req.body.email }).fetch().then(function (data) {
		if (data !== null) {
			// Almacena nueva contraseña y envía email
			var nuevoPassword = parseInt(Math.random() * 10e6);
			var encodePassword = config.encripta(newPassword);

			this.save({ cPassword: encodePassword }, { patch: false })
				.then(function () {
					const cEmailBody = pug.compileFile('views/emailRecuperaPassword.pug');

					email.server.send({
						from: 'SnapCar Seguros <no-responder@snapcar.com.ar>',
						to: req.body.email,
						subject: 'Nueva contraseña',
						attachment: [{
							data: cEmailBody({
								nuevoPassword: nuevoPassword,
								baseUrl: req.protocol + '://' + req.headers.host
							}),
							alternative: true
						}]
					}, function (err, message) { console.log(err || message); });
				});

			res.status(201).json({ success: true, message: 'Correo electrónico enviado' });
		} else {
			// No existe y se crea el usuario
			res.status(400).json({ success: false, code: 1220, message: 'Cuenta no existe' });
		}
	});
};
