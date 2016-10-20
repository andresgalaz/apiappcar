const Model		= require('../db/model');
const config	= require('../config/main');
const email		= require('../config/emailServer');
const Hash		= require('hashids');
const moment	= require("moment");

module.exports = function(req,res){
	const Util = require('../util');

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:',req.user);
	console.log(req.body);

	if(!req.body.idVehiculo ) {
		return res.status(400).json({ success: false, code: 2210, message: 'Falta ID del vehiculo.' });
	}
	if(!req.body.latitud ) {
		return res.status(400).json({ success: false, code: 2214, message: 'Falta latitud.' });
	}
	if(!req.body.longitud ) {
		return res.status(400).json({ success: false, code: 2218, message: 'Falta longitud.' });
	}
	if(!req.body.fechaHora ) {
		return res.status(400).json({ success: false, code: 2222, message: 'Falta fecha y hora de la denuncia siniestro.' });
	} else if(! moment(req.body.fechaHora,"YYYY-MM-DD HH:mm:ss").isValid()){
		return res.status(400).json({ success: false, code: 2223, message: 'Formato fecha debe ser yyyy-mm-dd hh:mm:ss.' });
	}
	if(!req.body.lesiones ) {
		return res.status(400).json({ success: false, code: 2226, message: 'Falta indicador si hay lesiones.' });
	}
	req.body.lesiones=(req.body.lesiones=='true' || req.body.lesiones=='1');

	new Model.VehTitular({fUsuario: req.user.pUsuario, fVehiculo: req.body.idVehiculo}).fetch().then(function(data){
		try {
			if( data === null){
  				return res.status(401).json({ success: false, code: 2230, message: 'No existe relación usuario / vehiculo'});
			}
			var newSini = new Model.Siniestro({
				fUsuario: req.user.pUsuario,
				fVehiculo: req.body.idVehiculo,
				nLT: req.body.latitud,
				nLG: req.body.longitud,
				tSiniestro: req.body.fechaHora,
				bLesiones: (req.body.lesiones ? '1' : '0'),
				cObservacion: (req.body.observaciones)
			});
			newSini.save().then(function(dataIns){
				var sini=dataIns.toJSON();
				var sObj = {
					sucess : true,
					idSiniestro : sini.pSiniestro
				};
				res.status(201).json(sObj);
			});
		} catch( e ) {
			console.log( e.stack );
        	return res.status(401).json({ success: false, code: 2250, message: 'Error inesperado.' });
		}
	});
};
