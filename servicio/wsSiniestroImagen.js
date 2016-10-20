const db		= require("../db/db");
const Model		= require('../db/model');
const config	= require('../config/main');
const email		= require('../config/emailServer');
const Hash		= require('hashids');
const moment	= require('moment');
const multer	= require('multer');
const fs		= require('fs');
const path		= require('path');

const DIR_ADJUNTO = '/home/ubuntu/adjunto/';
var upload = multer({ dest: DIR_ADJUNTO }).single('imagen');

module.exports = function(req,res){
	const Util = require('../util');

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format('YYYY-MM-DD HH:mm:ss'), '--------');
	console.log('req.user:',req.user);
	upload(req,res,function(err){
		if( err ){
			return res.status(400).json({ success: false, code: 2308, message: 'No se pudo subir el arhivo de imagen.' });
		}
		console.log(req.body);
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

		new Model.Siniestro({pSiniestro: req.body.idSiniestro}).fetch().then(function(data){
			try {
				if( data === null){
					return res.status(401).json({ success: false, code: 2330, message: 'No existe siniestro'});
				}
				// crea sub-dir usuario
				var destArch = path.join( DIR_ADJUNTO, req.user.pUsuario+'' );
				if( ! fs.existsSync( destArch )) fs.mkdirSync( destArch );
				// crea sub-dir siniestro
				destArch = path.join( destArch, req.body.idSiniestro+'' );
				if( ! fs.existsSync( destArch )) fs.mkdirSync( destArch );
				destArch = path.join( destArch, req.file.originalname );
				// Mueve desde el repositorio al definitivo
				fs.rename( req.file.path, destArch );

				var sObj = {
					sucess : true,
					idSiniestro : req.body.idSiniestro,
					archivo : req.file.originalname
				};

				db.scoreDB.knex("tSiniestroArchivo")
				.where('fSiniestro','=',req.body.idSiniestro)
				.andWhere('cNombreArchivo', '=', req.file.originalname)
				.update({ tArchivo : req.body.fechaHora, cTipo : req.body.tipo})
				.then(function(resp){
					if( resp == 0 ){
						// No existe, hay que insertar
						new Model.SiniestroArchivo({ fSiniestro: req.body.idSiniestro, cNombreArchivo: req.file.originalname, tArchivo : req.body.fechaHora, cTipo : req.body.tipo})
						.save()
						.then(function(dataIns){
							var arch=dataIns.toJSON();
							console.log(arch);
							sObj.idArchivo = arch.pArchivo;
							res.status(201).json(sObj);
							return;
						});
					} else {
						res.status(201).json(sObj);
						return;
					}
				});
			} catch( e ) {
				console.log( e.stack );
				return res.status(401).json({ success: false, code: 2350, message: 'Error inesperado.' });
			}
		});
	});

};
