const Model = require('../db/model');
const config = require('../config/main');
const jwt = require('jsonwebtoken');
const moment = require("moment");

module.exports = function(req,res){
	const Util = require('../util');

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	// La password se encripta antes de desplegar en la bitácora
	req.body.password = config.encripta(req.body.password);

	console.log(req.body);
	if(!req.body.email ) {
		return res.status(400).json({ success: false, code: 1310, message: 'Falta email.' });
	}
	if(!req.body.password && !req.body.google && !req.body.facebook) {
		return res.status(400).json({ success: false, code: 1320, message: 'Falta password.' });
	}
	new Model.UsuarioVeh({cEmail: req.body.email}).fetch({withRelated:['vehiculos']}).then(function(data){
		try {
			if (data !== null ) {
				var user = data.toJSON();
				// Create token if the password matched and no error was thrown
				const token = jwt.sign(Model.Usuario.token(user), config.secret, {
					expiresIn: 86400 // 24 horas en segundos
				});
				var usrOut = Model.UsuarioVeh.salida( user );
				usrOut.success = true;
				usrOut.token = 'JWT ' + token;
  				return res.status(200).json( usrOut );
			}
			// No existe y se crea el usuario
			if(!req.body.nombre) {
				return res.status(400).json({ success: false, code: 1330, message: 'Falta nombre.' });
			}
			if(!req.body.dni) {
				return res.status(400).json({ success: false, code: 1330, message: 'Falta DNI.' });
			} else if( ! Util.esDni( req.body.dni )) {
				return res.status(400).json({ success: false, code: 1332, message: 'Número de DNI incorrecto.' });
			}
			if( req.body.sexo && ! Util.esSexo( req.body.sexo )) {
				return res.status(400).json({ success: false, code: 1340, message: 'Tipo sexo incorrecto.' });
			}
			if( req.body.fechaNacimiento && ! Util.esFecha( req.body.fechaNacimiento )) {
				return res.status(400).json({ success: false, code: 1350, message: 'Fecha de nacimiento incorrecta.' });
			}

			var newUser = new Model.Usuario({
				cEmail		: req.body.email,
				cPassword	: req.body.password,
				cNombre		: req.body.nombre,
				nDni		: req.body.dni,
				cSexo		: req.body.sexo,
				dNacimiento	: req.body.fechaNacimiento
			});

			// Attempt to save the user
			newUser.save().then(function(dataIns) {
				var user = dataIns.toJSON();
				new Model.UsuarioVeh({pUsuario: user.pUsuario}).fetch({withRelated:['vehiculos']}).then(function(data){
					user = data.toJSON();
        			const token = jwt.sign(Model.Usuario.token(user), config.secret, {
        				expiresIn: 3024000 // 35 dias en segundos
        			});
					var usrOut = Model.UsuarioVeh.salida( user );
					usrOut.success = true;
					usrOut.token = 'JWT ' + token;
  					return res.status(200).json( usrOut );
				});
			});
		} catch( e ) {
			console.log( e );
        	return res.status(401).json({ success: false, code:1360, message: 'Error inesperado.' });
		}
	});
};
