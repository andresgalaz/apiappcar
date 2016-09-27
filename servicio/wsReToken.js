const Model = require('../db/model');
const config = require('../config/main');
const jwt = require('jsonwebtoken');
const moment = require("moment");

module.exports = function(req,res){
	const Util = require('../util');

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:',req.user);
	new Model.UsuarioVeh({pUsuario: req.user.pUsuario}).fetch({withRelated:['vehiculos'] }).then(function(data){
		try {
			var user = data;
			if( user === null){
  				return res.status(401).json({ success: false, code:1510, message: 'Usuario no existe'});
			} else {
				user = data.toJSON();
        		var token = 'error token';
        		token = jwt.sign( Model.Usuario.token(user), config.secret, {
        			expiresIn: 3024000 // 35 días en segundos
        		});
  				// return res.status(200).json({ success : true, token : 'JWT ' + token });
				var usrOut = Model.UsuarioVeh.salida( user );
				usrOut.success = true;
				usrOut.token = 'JWT ' + token;
  				return res.status(200).json( usrOut );
			}
		} catch( e ) {
			console.log( e );
        	return res.status(401).json({ success: false, code:1520, message: 'Error inesperado.' });
		}
	});
};
