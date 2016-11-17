const Model	= require('../db/model');
const moment= require("moment");

module.exports = function(req,res){
	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:',req.user);
	console.log(req.body);

	if(!req.body.estado ) {
		return res.status(400).json({ success: false, code: 2610, message: 'Falta estado de la APP.' });
	}
	if(!req.body.fechaHora ) {
		return res.status(400).json({ success: false, code: 2614, message: 'Falta fecha y hora de desconexión.' });
	} else if(! moment(req.body.fechaHora,"YYYY-MM-DD HH:mm:ss").isValid()){
		return res.status(400).json({ success: false, code: 2618, message: 'Formato fecha debe ser yyyy-mm-dd hh:mm:ss.' });
	}

	new Model.Usuario({pUsuario: req.user.pUsuario}).fetch().then(function(data){
		try {
			if( data === null){
  				return res.status(401).json({ success: false, code: 2620, message: 'No existe usuario'});
			}
			var estado = new Model.AppEstado({
				fUsuario: req.user.pUsuario,
				tCreacion: req.body.fechaHora,
				cDescripcion: req.body.estado
			});
			estado.save()
			.then(function(dataIns){
				res.status(201).json({ success : true });
			}).catch( function(err){
				console.log( err.stack );
				res.status(400).json({ success : false, code: 2630, message: 'Error inesperado de SQL:' + err.code });
			});
		} catch( e ) {
			console.log( e.stack );
        	return res.status(401).json({ success: false, code: 2634, message: 'Error inesperado.' });
		}
	});
};
