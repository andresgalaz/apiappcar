const Model = require('../db/model');
const config = require('../config/main');
const Hash = require('hashids');
const moment = require("moment");

module.exports = function (req, res) {
	const Util = require('../util');

	// Guarda la cantidad de resgitros pendientes de transmitir en el VIRLOC y
	// la Fecha-Hora del primer registro
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:', req.user);
	console.log(req.body);
	if (!req.body.idVehiculo) {
		return res.status(400).json({
			success: false,
			code: 3010,
			message: 'Falta id. de vehículo.'
		});
	}
	if (!req.body.fechaHora) {
		return res.status(400).json({
			success: false,
			code: 3022,
			message: 'Falta fecha y hora del primer registro.'
		});
	} else if (!moment(req.body.fechaHora, "YYYY-MM-DD HH:mm:ss").isValid()) {
		return res.status(400).json({
			success: false,
			code: 3023,
			message: 'Formato fecha debe ser yyyy-mm-dd hh:mm:ss.'
		});
	}
	if (!req.body.cantidad) {
		return res.status(400).json({
			success: false,
			code: 3026,
			message: 'Falta cantidad de registros.'
		});
	} else if (!/^\d*$/.test(req.body.cantidad)) {
		return res.status(400).json({
			success: false,
			code: 3027,
			message: 'La cantidad debe ser un entero positivo'
		});
	}

	new Model.Vehiculo({
		pVehiculo: req.body.idVehiculo
	}).fetch().then(function (data) {
		try {
			if (data === null) {
				return res.status(401).json({
					success: false,
					code: 3030,
					message: 'No existe vehículo'
				});
			}
			var regNuevo = new Model.InicioTransferencia({
				fVehiculo: req.body.idVehiculo,
				tRegistroActual: req.body.fechaHora,
				nCantidad: req.body.cantidad
			});
			// Graba registro
			var iniTransf = null;
			regNuevo.save().then(function (dataIns) {
				iniTransf = dataIns.toJSON();
				return res.status(200).json({
					success: true,
					idInicioTransaferencia: iniTransf.pInicioTransferencia
				});
			});
		} catch (e) {
			console.log(e.stack);
			return res.status(401).json({
				success: false,
				code: 3050,
				message: 'Error inesperado.'
			});
		}
	});
};
