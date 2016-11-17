//const User = require('../app/models/user');
const Model = require('../db/model');
const moment = require("moment");

module.exports = function(req,res){
	const Util = require('../util');

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:',req.user);
	console.log(req.body);
	if(!req.body.idVehiculo) {
		return res.status(400).json({ success: false, code: 1710, message: 'Falta id. de vehículo.' });
	}
	// Update Vehiculo
	new Model.Vehiculo({pVehiculo: req.body.idVehiculo, bVigente: '1'}).fetch().then(function(data){
		try {
			if (data === null ) {
				res.status(400).json({ success: false, code: 1720, message: 'Vehiculo no existe' });
			} else {
				var actVeh = new Model.Vehiculo(data.toJSON());
				// Se actualiza
				// actVeh.cPatente			= req.body.patente;
				actVeh.attributes.cIdDispositivo = null;
				// Attempt to save the user
				actVeh.save().then(function(model) {
					res.status(200).json({ success: true });
				});
			}
		} catch(e){
			console.log(e.stack);
			res.status(500).json({ success: false, code: 1730, message: 'Error inesperado al leer', errors: [ {code: 1732, message: e.message }]});
		};
	});
};
