const db = require("../db/db");
const moment = require("moment");

module.exports = function(req,res){
	const Util = require("../util");

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:',req.user);
	console.log(req.body);
	if(!req.body.fechaInicio || !req.body.fechaFin) {
		return res.status(400).json({ success: false, code: 1910, message: "Falta rango de fechas." });
	}
	var dIni = moment(req.body.fechaInicio, "YYYY-MM-DD");
	if( !dIni.isValid() ) {
		return res.status(400).json({ success: false, code: 1912, message: "Fecha de inicio no válica." });
	}
	var dFin = moment(req.body.fechaFin, "YYYY-MM-DD");
	if( !dFin.isValid() ) {
		return res.status(400).json({ success: false, code: 1912, message: "Fecha de fin no válica." });
	}
	if( dIni > dFin ) {
		return res.status(400).json({ success: false, code: 1914, message: "La fecha de inicio debe ser anterior a la fecha de fin." });
	}

    var qEventoSum = db.scoreDB.knex("vEvento")
		.select("fTpEvento as idEvento", "cEvento as tipoEvento")
 		.count("fTpEvento as cantidad");
    var qEventoVeh = db.scoreDB.knex("vEvento")
		.select("fVehiculo as idVehiculo", "fTpEvento as idEvento", "cEvento as tipoEvento")
 		.count("fTpEvento as cantidad");
    var qScore = db.scoreDB.knex("vScoreMes")
		.select("fVehiculo as idVehiculo", "cPatente as patente", "nKms as kms", "nScore as score"
			  , "nDescuento as descuento", "fUsuarioTitular as idUsuarioTitular" );

	/*
	 * Si se indica usuario se filtra por los usuarios que tienen acceso al vehiculo.
	 * Si el usuario no coincide con el del Token, se filtra por usuario titular.
	 */
	if( req.body.idUsuario !== undefined ){
		qEventoSum.where("fUsuario", req.body.idUsuario);
		qEventoVeh.where("fUsuario", req.body.idUsuario);
		qScore.where("fUsuario", req.body.idUsuario);

		if( req.body.idUsuario != req.user.pUsuario ){
			qEventoSum.andWhere("fUsuarioTitular", req.user.pUsuario);
			qEventoVeh.andWhere("fUsuarioTitular", req.user.pUsuario);
			qScore.andWhere("fUsuarioTitular", req.user.pUsuario);
		}
	} else {
		qEventoSum.where("fUsuario", req.user.pUsuario);
		qEventoVeh.where("fUsuario", req.user.pUsuario);
		qScore.where("fUsuario", req.user.pUsuario);
	}

	if( req.body.idVehiculo !== undefined ){
		qEventoSum.andWhere("fVehiculo", req.body.idVehiculo);
		qEventoVeh.andWhere("fVehiculo", req.body.idVehiculo);
		qScore.andWhere("fVehiculo", req.body.idVehiculo);
	}

    qEventoSum
		.andWhere( "tEvento",">=", req.body.fechaInicio)
		.andWhere( "tEvento","<=", req.body.fechaFin)
		.groupBy("fTpEvento","cEvento");
    qEventoVeh
		.andWhere( "tEvento",">=", req.body.fechaInicio)
		.andWhere( "tEvento","<=", req.body.fechaFin)
		.groupBy("fVehiculo", "fTpEvento","cEvento");

    qScore
		.andWhere( "dPeriodo",">=", req.body.fechaInicio)
		.andWhere( "dPeriodo","<=", req.body.fechaFin);

	// No se respta la identación porque el encadenamiento solo obedece a que es Asincronico

	// Cursor de eventos
    qEventoSum.then(function(arrEventoSum){
	try {
		if (arrEventoSum === null ) {
			return res.status(400).json({ success: false, code: 1918, message: "Error al ejecutar consulta de Eventos" });
		} 
	// Cursor Score Mensual
    qEventoVeh.then(function(arrEventoVeh){
	try {
		if (arrEventoVeh === null ) {
			return res.status(400).json({ success: false, code: 1920, message: "Error al ejecutar consulta de Score" });
		} 

    qScore.then(function(arrScore){
	try {
		if (arrScore === null ) {
			return res.status(400).json({ success: false, code: 1920, message: "Error al ejecutar consulta de Score" });
		} 

		var nKms = 0;
		var nScore = 0;
		var nDescuento = 0;
		// var arr = [];
		arrScore.forEach(function(entry){
			// arr[arr.length] = { fecha: moment(entry.fecha).format("YYYY-MM-DD"), valor: entry.valor };
			nScore += entry.score;
			nKms += entry.kms;
			nDescuento += entry.descuento;
			entry.eventos = [];     
		});
		if( arrScore.length > 0 ){
			nScore = nScore / arrScore.length;
			nDescuento = nDescuento / arrScore.length;
		}
		arrEventoVeh.forEach(function(entry){
			var vehiculo = null;
 			for( var i=0 ; i < arrScore.length ; i++){
				if ( arrScore[i].idVehiculo == entry.idVehiculo ){
					vehiculo = arrScore[i];
					break;
				}
            }
			if( vehiculo ){
				// if( ! vehiculo.eventos )
					// vehiculo.eventos = [];
				delete entry['idVehiculo'];
				vehiculo.eventos.push( entry );
			}
		});

		var sObj = {
			sucess : true,
			kms : Math.round(nKms*100)/100,
			scorePeriodo : Math.round(nScore*100)/100,
			descuento : Math.round(nDescuento*100)/100,
			eventos : arrEventoSum,
			vehiculos : arrScore
		};
		res.status(201).json(sObj);
	} catch(e){
		console.log(e.stack);
		res.status(500).json({ success: false, code:1932, message: "Error inesperado al leer Score SUma", errors: [ {code: 1933, message: e.message }]});
	} });
	} catch(e){
		console.log(e.stack);
		res.status(500).json({ success: false, code:1934, message: "Error inesperado al leer Evento Vehiculo", errors: [ {code: 1933, message: e.message }]});
	} });
	} catch(e){
		console.log(e.stack);
		res.status(500).json({ success: false, code:1936, message: "Error inesperado al leer Eventos", errors: [ {code: 1935, message: e.message }]});
	} });
};
