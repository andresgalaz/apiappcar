const db = require("../db/db");
const moment	= require('moment');

module.exports = function(req,res){
	const Util = require('../util');

	// Lista Siniestros de un Usuario
	console.log('---------', moment().format('YYYY-MM-DD HH:mm:ss'), '--------');
	console.log('req.user:',req.user);
	console.log(req.body);

	var qSini = db.scoreDB.knex("vSiniestro")
		.select( 'pSiniestro as idSiniestro'			, 'fVehiculo as idVehiculo'
			   , 'nLG as LG'							, 'nLT as LT'
			   , 'tSiniestro as fechaHora'				, 'bLesiones as lesiones'
			   , 'cPatente as patente'					, 'fUsuario as idConductor'
			   , 'cUsuario as nombreConductor'			, 'fUsuarioTitular as idTitular'
			   , 'cUsuarioTitular as nombreTitular'		, 'cObservacion as observaciones'
		       , db.scoreDB.knex.raw('fnSiniOtrosConductoresJSON(pSiniestro) as involucrados'));
	if( req.body.idUsuario !== undefined ){
		qSini.where("fUsuario", req.body.idUsuario);
		if( req.body.idUsuario != req.user.pUsuario ){
			qSini.andWhere("fUsuarioTitular", req.user.pUsuario);
		}
	} else {
		qSini.where('fUsuario', req.user.pUsuario);
	}

	qSini.then(function(arrSini){
		try {
			if( arrSini === null){
				return res.status(401).json({ success: false, code: 2430, message: 'No hay siniestros para el usuario'});
			}
			// ES necesario ejecutar PARSE sobre la columna involucrados, porque esta es un STRING
			arrSini.forEach(function(entry){
				console.log(entry.involucrados);
				entry.involucrados = JSON.parse(entry.involucrados);
			});
			res.status(201).json(arrSini);
		} catch( e ) {
			console.log( e.stack );
			return res.status(401).json({ success: false, code: 2450, message: 'Error inesperado.' });
		}
	});
};
