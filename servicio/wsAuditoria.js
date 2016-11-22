const db		= require("../db/db");
const Model		= require('../db/model');
const config	= require('../config/main');
// const Hash		= require('hashids');
const moment	= require('moment');
const multer	= require('multer');
const fs		= require('fs');
const path		= require('path');

//'archivo' es el nombre del campo UPLOAD que viene del formulario
var upload = multer({ dest: config.dirAdjunto }).single('archivo');

module.exports = function(req,res){
	const Util = require('../util');

	// Ingresa los datos de control de Auditoría
	console.log('---------', moment().format('YYYY-MM-DD HH:mm:ss'), '--------');
	console.log('req.user:',req.user);
	upload(req,res,function(err){
		console.log(req.body);
		console.log(req.file);
		if( err ){
			if( err.code == 'LIMIT_UNEXPECTED_FILE' )
				return res.status(400).json({ success: false, code: 2706, message: "Se esperaba 'archivo' como nombre de campo"});
			return res.status(400).json({ success: false, code: 2708, message: 'No se pudo subir el arhivo de imagen.' });
		}
		if(!req.body.idVehiculo ) {
			return res.status(400).json({ success: false, code: 2710, message: 'Falta ID del vehículo.' });
		}
		if(!req.body.kms ) {
			return res.status(400).json({ success: false, code: 2714, message: "Falta campo 'kms'" });
		}
		// Se espara que KMS sea un número decimal
		if( ! /^-?\d*(\.\d+)?$/.test(req.body.kms)) {
			return res.status(400).json({ success: false, code: 2718, message: "Kilometros debe ser numérico" });
		}

		new Model.Vehiculo({pVehiculo: req.body.idVehiculo}).fetch() //
		.then(function(data){
			try {
				if( data === null){
					return res.status(401).json({ success: false, code: 2720, message: 'No existe vehículo'});
				}
				// crea sub-dir usuario
				var destArch = path.join( config.dirAdjunto, req.user.pUsuario+'' );
				if( ! fs.existsSync( destArch )) fs.mkdirSync( destArch );
				// crea sub-dir de auditoria
				destArch = path.join( destArch, 'auditoria' );
				if( ! fs.existsSync( destArch )) fs.mkdirSync( destArch );
				// Nombre del archivo se guarda con la fecha y hora, y se mantiene la extensión del archivo original
				var cNomArchivo = moment().format('YYYYMMDD_HHmmss') + path.extname(req.file.originalname);
				destArch = path.join( destArch, cNomArchivo );
				// Mueve desde el repositorio al definitivo
				fs.rename( req.file.path, destArch );
	
				var sObj = {
					success : true,
					idVehiculo : req.body.idVehiculo,
					archivo : req.file.originalname,
					auditoria : cNomArchivo
				};
	
				new Model.Auditoria({ fVehiculo: req.body.idVehiculo
									, cNombreArchivo: cNomArchivo
									, nKilometros : req.body.kms})
				.save()
				.then(function(dataIns){
					var arch=dataIns.toJSON();
					console.log(arch);
					sObj.idArchivo = arch.pArchivo;
					res.status(201).json(sObj);
					return;
				});
			} catch( e ) {
				console.log( e.stack );
				return res.status(401).json({ success: false, code: 2750, message: 'Error inesperado.' });
			};
		});
	});

};
