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
		return res.status(400).json({ success: false, code: 1110, message: 'Falta email.' });
	}
	if(!req.body.password && !req.body.google && !req.body.facebook) {
		return res.status(400).json({ success: false, code: 1120, message: 'Falta password.' });
	}
	new Model.UsuarioVeh({cEmail: req.body.email}).fetch({withRelated:['vehiculos'] }).then(function(data){
		try {
			var user = data;
			if( user === null){
  				return res.status(401).json({ success: false, code:1130, message: 'Usuario no existe'});
			} else {
				user = data.toJSON();
				// Acepta token de Google o Facebook, sino password
				if( req.body.google || req.body.facebook || req.body.password ==  user.cPassword ) {
        			// Create token if the password matched and no error was thrown
        			var token = 'error token';
        			token = jwt.sign( Model.Usuario.token(user), config.secret, {
        				expiresIn: 3024000 // 35 días en segundos
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

/*
{ email: 'andres.galaz@gmail.com',
  nombre: 'Andres Galaz',
  password: 'aaaaaa',
  dni: '95504597',
  fechaNacimiento: '1962-1-18',
  sexo: 'M',
  google:
   { id: '101720966443198140177',
     token: 'ya29.CjCXA0WmzC401QOHJcY8ImqluDqwK1CbYmn3dtwPR2I59O6n1PtbWs0LnY0UMqjKFUo' }
}
*/

/*
{ email: 'andres.galaz@gmail.com',
  nombre: 'Andrés Galaz',
  password: 'MFRd2aZ+508zisA3sqnA5hC94NkWjJ4FaTBsckzPIBI=',
  dni: '95504594',
  fechaNacimiento: '1962-1-18',
  sexo: 'M',
  facebook:
   { id: '10211735510362514',
     token: 'EAAEMbBZCgGWkBANuJHhzlczZATN0uakPZBN912bh7IebAmU2ZBl4dZBRJ9rmfRgexFZAOoS7b6CWa1e88cT4dHCN9ZBwdCBlow36W0WXFG4D1jvEl6sdeZCOlz1nMKdDHzEkaZAMmNseSNyhaBUJ3ZAtgMwVeiTvlE7oZAAAgAwVq7HNJgjo3OCVlPxfG2tMKsCpsIZD' }
}
*/
