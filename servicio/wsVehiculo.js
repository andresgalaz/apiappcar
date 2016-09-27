//const User = require('../app/models/user');
const Model = require('../db/model');
const moment = require("moment");

module.exports = function(req,res){
	const Util = require('../util');

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:',req.user);
	console.log(req.body);
	if(!req.body.patente && !req.body.idVehiculo) {
		return res.status(400).json({ success: false, code: 1410, message: 'Falta id. de vehículo o patente.' });
	}
	if(req.body.patente && ! Util.validaPatente( req.body.patente )) {
		return res.status(400).json({ success: false, code: 1412, message: 'Patente incorrecta.' });
	}
	if( req.body.tipoDispositivo && ! Model.Vehiculo.validaTpDispositivo( req.body.tipoDispositivo ) ) {
		return res.status(400).json({ success: false, code: 1420, message: 'Tipo de dispositivo fuera de rango.' });
	}
	if( req.body.id && req.body.id.length > 100 ) {
		return res.status(400).json({ success: false, code: 1422, message: 'ID. de dispositivo demasiado largo.' });
	}
	if( req.body.marca && req.body.marca.length > 40 ) {
		return res.status(400).json({ success: false, code: 1424, message: 'Nombre de la marca demasiado largo.' });
	}
	if( req.body.modelo && req.body.modelo.length > 60 ) {
		return res.status(400).json({ success: false, code: 1426, message: 'Nomdre del modelo demasiado largo.' });
	}
	if(req.body.idVehiculo) {
		// Update Vehiculo
		new Model.Vehiculo({pVehiculo: req.body.idVehiculo}).fetch().then(function(data){
			try {
				if (data === null ) {
					return res.status(400).json({ success: false, code: 1430, message: 'Vehiculo no existe' });
				} 
				var actVeh = new Model.Vehiculo(data.toJSON());
				// actVeh.cPatente			= req.body.patente;
				actVeh.attributes.cMarca			= req.body.marca;
				actVeh.attributes.cModelo			= req.body.modelo;
				actVeh.attributes.fTpDispositivo	= req.body.tipoDispositivo;
				actVeh.attributes.cIdDispositivo	= req.body.id;
				// Attempt to save the user
				actVeh.save().then(function(model) {
					try {
						var veh = Model.Vehiculo.salida( model.toJSON());
						veh.success = true;
						res.status(201).json(veh);
					} catch(e){
						console.log(e.stack);
						res.status(500).json({ success: false, code:1436, message: 'Error inesperado al grabar', errors: [ {code: 1438, message: e.message }]});
					}
				});
			} catch(e){
				console.log(e.stack);
				res.status(500).json({ success: false, code:1436, message: 'Error inesperado al leer', errors: [ {code: 1438, message: e.message }]});
			}
		});
	} else {
		// Insert Vehiculo
		new Model.Vehiculo({cPatente: req.body.patente, bVigente: '1'}).fetch().then(function(data){
			try {
				if (data !== null ) {
					return res.status(400).json({ success: false, code: 1440, message: 'Patente ya existe' });
				}
				// No existe y se crea el usuario
				var newVeh = new Model.Vehiculo({
					cPatente			: req.body.patente,
					cMarca				: req.body.marca,
					cModelo				: req.body.modelo,
					fTpDispositivo		: req.body.tipoDispositivo,
					cIdDispositivo		: req.body.id,
					fUsuarioTitular		: req.user.pUsuario
				});
 	
				// Se busca cuenta dle usuaeio
				new Model.Cuenta({fUsuarioTitular: req.user.pUsuario}).fetch().then(function(mCta){
					try {
						if (mCta === null ) {
							return res.status(400).json({ success: false, code: 1452, message: 'Usuario no tiene cuenta asociada' });
						} 
						var cta = mCta.toJSON();
						newVeh.attributes.fCuenta = cta.pCuenta;
						// Se inserta
						newVeh.save().then(function(model) {
							try {
								var veh = Model.Vehiculo.salida( model.toJSON());
								veh.success = true;
								res.status(201).json(veh);
							} catch(e){
								console.log(e.stack);
								res.status(500).json({ success: false, code:1454, message: 'Error inesperado al grabar', errors: [ {code: 1455, message: e.message }]});
							}
						});
					} catch(e){
						console.log(e.stack);
						res.status(500).json({ success: false, code:1458, message: 'Error inesperado al leer', errors: [ {code: 1459, message: e.message }]});
					}
				});
			} catch(e){
				console.log(e.stack);
				res.status(500).json({ success: false, code:1450, message: 'Error inesperado al leer', errors: [ {code: 1452, message: e.message }]});
			}
		});
	}
};
