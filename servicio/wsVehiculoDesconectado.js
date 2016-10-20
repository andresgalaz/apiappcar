const Model	= require('../db/model');
const moment= require("moment");

module.exports = function(req,res){
	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:',req.user);
	console.log(req.body);

	if(!req.body.idVehiculo ) {
		return res.status(400).json({ success: false, code: 2510, message: 'Falta ID del vehiculo.' });
	}
	if(!req.body.servicioDesconectado ) {
		return res.status(400).json({ success: false, code: 2514, message: 'Falta tipo de servicio desconectado.' });
	}
	if( req.body.servicioDesconectado!='1' && req.body.servicioDesconectado!='2' ) {
		return res.status(400).json({ success: false, code: 2518, message: 'Tipo de servicio desconectado no existe.' });
	}
	if(!req.body.fechaHora ) {
		return res.status(400).json({ success: false, code: 2522, message: 'Falta fecha y hora de desconexión.' });
	} else if(! moment(req.body.fechaHora,"YYYY-MM-DD HH:mm:ss").isValid()){
		return res.status(400).json({ success: false, code: 2523, message: 'Formato fecha debe ser yyyy-mm-dd hh:mm:ss.' });
	}

	new Model.VehTitular({fUsuario: req.user.pUsuario, fVehiculo: req.body.idVehiculo}).fetch().then(function(data){
		try {
			if( data === null){
  				return res.status(401).json({ success: false, code: 2530, message: 'No existe relación usuario / vehiculo'});
			}
			var newVehD = new Model.VehDesconectado({
				pVehiculo: req.body.idVehiculo,
				ptDesconectado: req.body.fechaHora,
				nTpServicio: req.body.fechaHora
			});
			newVehD.save()
			.then(function(dataIns){
				res.status(201).json({ success : true });
			}).catch( function(err){
				if( err.code == 'ER_DUP_ENTRY')
					res.status(201).json({ success : false, message: 'Registro ya existe' });
				else
					res.status(201).json({ success : false, message: 'Error inesperado de SQL:' + err.code });
			});
		} catch( e ) {
			console.log( e.stack );
        	return res.status(401).json({ success: false, code: 2550, message: 'Error inesperado.' });
		}
	});
};
