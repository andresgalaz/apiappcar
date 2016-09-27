const Model		= require('../db/model');
const config	= require('../config/main');
const email		= require('../config/emailServer');
const Hash		= require('hashids');
const moment	= require('moment');
const multer	= require('multer');

var upload = multer({ dest: '/home/ubuntu/adjunto/' }).single('imagen');

module.exports = function(req,res){
	const Util = require('../util');

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format('YYYY-MM-DD HH:mm:ss'), '--------');
	console.log('req.user:',req.user);
	console.log(req.body);
	upload(req,res,function(err){
		if( err ){
			return res.status(400).json({ success: false, code: 2308, message: 'No se pudo subir el arhivo de imagen.' });
		}
		console.log(req.file);
		if(!req.body.idSiniestro ) {
			return res.status(400).json({ success: false, code: 2310, message: 'Falta ID del vehiculo.' });
		}
		if(!req.body.fechaHora ) {
			return res.status(400).json({ success: false, code: 2322, message: 'Falta fecha y hora de la denuncia siniestro.' });
		} else if(! moment(req.body.fechaHora,'YYYY-MM-DD HH:mm:ss').isValid()){
			return res.status(400).json({ success: false, code: 2323, message: 'Formato fecha debe ser yyyy-mm-dd hh:mm:ss.' });
		}
		if(!req.body.tipo ) {
			return res.status(400).json({ success: false, code: 2314, message: 'Falta tipo.' });
		}
		// if(!req.body.imagen ) {
			// return res.status(400).json({ success: false, code: 2318, message: 'Falta Imagen.' });
		// }

		new Model.Siniestro({pSiniestro: req.body.idSiniestro}).fetch().then(function(data){
			try {
				if( data === null){
					return res.status(401).json({ success: false, code: 2330, message: 'No existe siniestro'});
				}
				console.log(data.toJSON());
				var sObj = {
					sucess : true,
					idSiniestro : 100,
					archivo : req.file.originalname
				};
				res.status(201).json(sObj);

			} catch( e ) {
				console.log( e.stack );
				return res.status(401).json({ success: false, code: 2350, message: 'Error inesperado.' });
			}
		});
	});

};
