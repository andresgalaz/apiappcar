//const User = require('../app/models/user');
const Model = require('../db/model');
const moment = require("moment");

module.exports = function(req,res){

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:',req.user);
	console.log(req.body);
	if(!req.body.nuevaPassword || !req.body.confirmaPassword) {
		return res.status(400).json({ success: false, code: 1610, message: 'Falta nueva password o confirma password.' });
	}
	if(req.body.nuevaPassword != req.body.confirmaPassword) {
		return res.status(400).json({ success: false, code: 1612, message: 'Nueva password y confirma password, deben ser iguales' });
	}
	new Model.Usuario({pUsuario: req.user.pUsuario}).fetch().then(function(data){
		try {
			if (data === null ) {
				res.status(400).json({ success: false, code: 1620, message: 'Usuario no existe o Token erróneo' });
			} else {
				var actUsr = new Model.Usuario(data.toJSON());
				// Se actualiza
				actUsr.attributes.cPassword = req.body.nuevaPassword;
 	
				// Attempt to save the user
				actUsr.save().then(function(model) {
					res.status(200).json({ success: true });
				});
			}
		} catch(e){
			console.log(e.stack);
			res.status(500).json({ success: false, code:1630, message: 'Error inesperado', errors: [ {code: 1632, message: e.message }]});
		}
	});
};
