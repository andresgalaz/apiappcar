const Model = require('../db/model');
const config = require('../config/main');
const jwt = require('jsonwebtoken');
const moment = require("moment");

module.exports = function(req,res){
	const Util = require('../util');

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log(req.body);
	if(!req.body.email ) {
		return res.status(400).json({ success: false, code: 1110, message: 'Falta email.' });
	}
	if(!req.body.password) {
		return res.status(400).json({ success: false, code: 1120, message: 'Falta password.' });
	}
	new Model.UsuarioVeh({cEmail: req.body.email}).fetch({withRelated:['vehiculos'] }).then(function(data){
		try {
			var user = data;
			if( user === null){
  				return res.status(401).json({ success: false, code:1130, message: 'Usuario no existe'});
			} else {
				user = data.toJSON();
				// if(bcrypt.compareSync( req.body.password, user.cPassword)) {
				if( req.body.password ==  user.cPassword ) {
        			// Create token if the password matched and no error was thrown
        			var token = 'error token';
        			token = jwt.sign( Model.Usuario.token(user), config.secret, {
        				expiresIn: 3024000 // 35 dÃ­as en segundos
        			});
					var usrOut = Model.UsuarioVeh.salida( user );
					usrOut.success = true;
					usrOut.token = 'JWT ' + token;
  					return res.status(200).json( usrOut );
        		} else {
        			return res.status(401).json({ success: false, code:1140, message: 'La password no coincide.' });
				}
			}
		} catch( e ) {
			console.log( e );
        	return res.status(401).json({ success: false, code:1150, message: 'Error inesperado.' });
		}
	});
};
