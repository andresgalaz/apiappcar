const db = require("../db/db");
const moment = require("moment");

module.exports = function(req,res){
	const Util = require("../util");

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:',req.user);
	console.log(req.body);
	if(!req.body.fechaInicio || !req.body.fechaFin) {
		return res.status(400).json({ success: false, code: 2012, message: "Falta rango de fechas." });
	}
	var dIni = moment(req.body.fechaInicio, "YYYY-MM-DD");
	if( !dIni.isValid() ) {
		return res.status(400).json({ success: false, code: 2013, message: "Fecha de inicio no válica." });
	}
	var dFin = moment(req.body.fechaFin, "YYYY-MM-DD");
	if( !dFin.isValid() ) {
		return res.status(400).json({ success: false, code: 2014, message: "Fecha de fin no válica." });
	}
	if( dIni > dFin ) {
		return res.status(400).json({ success: false, code: 2015, message: "La fecha de inicio debe ser anterior a la fecha de fin." });
	}

	// Lista score
	var objEventosPorViaje={};
	var arrConductor = [];
	var nScoreGlobal = 0;
	var nKmsGlobal = 0;

	var eventoSum= [
        { "idEvento": "3", "tipoEvento": "Aceleración"     , "cantidad": 0 },
        { "idEvento": "4", "tipoEvento": "Frenada"         , "cantidad": 0 },
        { "idEvento": "5", "tipoEvento": "Exceso Velocidad", "cantidad": 0 }
      ];

    var qIdViaje = db.scoreDB.knex("vViaje")
		.select("nIdViaje")
		.where		("tInicio"	, 	">="	,	req.body.fechaInicio)
		.andWhere	("tInicio"	, 	"<="	,	req.body.fechaFin);
	var qConductor = db.scoreDB.knex("vScoreMesConductor")
		.select	(	"fUsuario as idConductor"	,	"cUsuario as conductor"
				,	db.scoreDB.knex.raw('sum(nScore * nKms) as scoreKm'))
		.sum	(	"nKms as kms"				)
		.where	( function() { this.where('fUsuarioTitular', req.user.pUsuario).orWhere('fUsuario', req.user.pUsuario) })
		.andWhere	("dPeriodo"	,	">="	,	req.body.fechaInicio)
		.andWhere	("dPeriodo"	,	"<="	,	req.body.fechaFin);
	var qVeh = db.scoreDB.knex("vConductorVehiculo")
		.select(	"fUsuarioTitular as idTitular"		,	"cUsuarioTitular as titular"
				,	"fUsuario as idConductor"
				,	"fVehiculo as idVehiculo"			,	"cPatente as patente"
				,	"nKms as kms"						,	"nScore as score" 		)
		.where		("dPeriodo"	,	">="	,	req.body.fechaInicio)
		.andWhere	("dPeriodo"	,	"<="	,	req.body.fechaFin);
	var qViaje = db.scoreDB.knex("vViaje")
		.select(	"nIdViaje as idViaje"			,	"fVehiculo as idVehiculo"	,	"cPatente as patente"
				,	"cCalleInicio as calleInicio"	,	"cCalleFin as calleFin"		,	"tInicio as fechaInicio"
				,	"tFin as fechaFin"				,	"nScore as score"
				,	"fUsuarioTitular as idTitular"	,	"cNombreTitular as titular"
				,	"fUsuario as idConductor"		,	"cNombreConductor as conductor"
				,	"nKms as kms"						)
		.where		("tInicio"	,	">="	,	req.body.fechaInicio)
		.andWhere	("tInicio"	,	"<="	,	req.body.fechaFin);

	/*
	 * Si se indica usuario se filtra por los usuarios que tienen acceso al vehiculo.
	 * Si el usuario no coincide con el del Token, se filtra por usuario titular.
	 */
	if( req.body.idUsuario !== undefined ){
		qIdViaje.andWhere	("fUsuario", req.body.idUsuario);
		qVeh.andWhere		("fUsuario", req.body.idUsuario);
		qViaje.andWhere		("fUsuario", req.body.idUsuario);

		if( req.body.idUsuario != req.user.pUsuario ){
			qIdViaje.andWhere	("fUsuarioTitular", req.user.pUsuario);
			qVeh.andWhere		("fUsuarioTitular", req.user.pUsuario);
			qViaje.andWhere		("fUsuarioTitular", req.user.pUsuario);
		};
	} else {
        qIdViaje.andWhere(function() {
            this.where('fUsuarioTitular', req.user.pUsuario).orWhere('fUsuario', req.user.pUsuario)
        });
        qVeh.andWhere(function() {
            this.where('fUsuarioTitular', req.user.pUsuario).orWhere('fUsuario', req.user.pUsuario)
        });
        qViaje.andWhere(function() {
            this.where('fUsuarioTitular', req.user.pUsuario).orWhere('fUsuario', req.user.pUsuario)
        });
	}

	if( req.body.idVehiculo !== undefined ){
		qIdViaje.andWhere	("fVehiculo", req.body.idVehiculo);
		qVeh.andWhere		("fVehiculo", req.body.idVehiculo);
		qConductor.andWhere	("fVehiculo", req.body.idVehiculo);
		qViaje.andWhere		("fVehiculo", req.body.idVehiculo);
	}
	qConductor.groupBy( "fUsuario", "cUsuario" );

	// No se respeta la identación porque el encadenamiento solo obedece a que es Asincronico

	// Cursor de viajes a buscar para obtener el resumen de eventos de cada viaje
	qIdViaje.pluck('nIdViaje').then(function( id ){
	if (id === null ) {
		return res.status(400).json({ success: false, code: 2018, message: "Error al ejecutar consulta de Viajes" });
	}
	try {
		for( var i = 0 ; i < id.length ; i++ ){
			// var nIdViaje = id [ i ] + 0;
   			db.scoreDB.knex("vEvento")
			.select("nIdViaje as idViaje", "fTpEvento as idEvento", "cEvento as tipoEvento")
			.count("fTpEvento as cantidad")
			.where("nIdViaje", id[i])
			.groupBy("fTpEvento","cEvento").then(function( arrEventoViaje ){
				if( arrEventoViaje.length > 0 )
					objEventosPorViaje['id_'+arrEventoViaje[0].idViaje ] = arrEventoViaje;
				for( var i=0 ; i < arrEventoViaje.length ; i++){
					var eventoViaje = arrEventoViaje[i];
					delete eventoViaje["idViaje"];
					var sum = eventoSum.filter(function(o){ return o.idEvento == eventoViaje.idEvento });
					sum[0].cantidad += eventoViaje.cantidad;
				};
			});
		}
	} catch(e){
		console.log(e.stack);
		return res.status(500).json({ success: false, code:2022, message: "Error inesperado al leer eventos del viaje", errors: [ {code: 2023, message: e.message }]});

	} })
	// Cursor de Conductores
	.then(function(a,b){ qConductor.then(function( data ){
	if (data === null ) {
		return res.status(400).json({ success: false, code: 2024, message: "Error al ejecutar consulta de Conductores" });
	}
	try {
		arrConductor = data;
		if( arrConductor.length == 0 ){
			// Se fuerza la existencia del conductor mismo, dado que no va a tener Score si no tiene
			// autos asociados
			arrConductor.push({
				idConductor : req.user.pUsuario,
				conductor : req.user.cNombre,
				score : 100,
				kms : 0,
				eventos : [ { idEvento: '3', tipoEvento: 'Aceleración'     , cantidad: 0 }
						  , { idEvento: '4', tipoEvento: 'Frenada'         , cantidad: 0 }
						  , { idEvento: '5', tipoEvento: "Exceso Velocidad", cantidad: 0 }]
			});
		} else {
			// Inicializa Acumuladores para los viajes
			for( var i=0 ; i < arrConductor.length ; i++){
				nKmsGlobal += arrConductor[i].kms;
				nScoreGlobal += arrConductor[i].scoreKm;
				if( arrConductor[i].kms == 0 )
					arrConductor[i].score = 100;
				else
					arrConductor[i].score = ( arrConductor[i].scoreKm / arrConductor[i].kms );
				delete arrConductor[i].scoreKm;
				arrConductor[i].eventos = [ { idEvento: '3', tipoEvento: 'Aceleración'     , cantidad: 0 }
										  , { idEvento: '4', tipoEvento: 'Frenada'         , cantidad: 0 }
										  , { idEvento: '5', tipoEvento: "Exceso Velocidad", cantidad: 0 }];
			};
		}
		if( nKmsGlobal == 0 )
			nScoreGlobal = 100;
		else
			nScoreGlobal = ( nScoreGlobal / nKmsGlobal );

	// Cursor de vehiculos
	qVeh.then(function( data ){
	if (data === null ) {
		return res.status(400).json({ success: false, code: 2024, message: "Error al ejecutar consulta de Vehiculos" });
	}
	try {
		arrVeh = data;
		// Inicializa Acumuladores para los viajes
		for( var i=0 ; i < arrConductor.length ; i++){
			var conductor = arrConductor[i];
			conductor.vehiculos=[];
			for( var j=0 ; j < arrVeh.length ; j++){
				var veh = arrVeh[j];
				if( conductor.idConductor == veh.idConductor ){
					delete veh["idConductor"];
					conductor.vehiculos.push( veh );
				}
			}
		}

	// Termina la busqueda de Eventos para cada viaje y se listan los viajes con todos sus datos
	qViaje.then(function( arrViaje ){
	if (arrViaje === null ) {
		return res.status(400).json({ success: false, code: 2026, message: "Error al ejecutar consulta de Viajes" });
	}
	try {
		for( var nViaje=0 ; nViaje < arrViaje.length ; nViaje++){
			var viaje=arrViaje[nViaje];
 			viaje.kms   = viaje.kms || 0;
			viaje.score = viaje.score || 100;
			viaje.eventos = [ { idEvento: '3', tipoEvento: 'Aceleración'     , cantidad: 0 }
                            , { idEvento: '4', tipoEvento: 'Frenada'         , cantidad: 0 }
                            , { idEvento: '5', tipoEvento: "Exceso Velocidad", cantidad: 0 }];
			var eventos = objEventosPorViaje['id_'+viaje.idViaje];
			if( eventos ){
				// Suma los eventos al viaje
				for( var iv = 0 ; iv < viaje.eventos.length ; iv++ ){
					for( var je = 0 ; je < eventos.length ; je++ ){
						if( viaje.eventos[iv].idEvento == eventos[je].idEvento ){
							viaje.eventos[iv].cantidad += eventos[je].cantidad;
							break;
						}
					}
				}
			}
			var nConductorFound = -1;
			for( var nConductor = 0 ; nConductor < arrConductor.length ; nConductor++ ){
				if( arrConductor[nConductor].idConductor == viaje.idConductor ){
					nConductorFound = nConductor;
					break;
				}
			}
			if( nConductorFound >= 0 ) {
				var conductor = arrConductor[nConductorFound];
				if( ! conductor.cantidadViajes )
					conductor.cantidadViajes = 0;
				conductor.cantidadViajes++;
				// Suma el evento del viaje correspondiente al vehiculo
				for( var iv = 0 ; iv < viaje.eventos.length ; iv++ ){
					for( var je = 0 ; je < conductor.eventos.length ; je++ ){
						if( viaje.eventos[iv].idEvento == conductor.eventos[je].idEvento ){
							conductor.eventos[je].cantidad+=viaje.eventos[iv].cantidad;
							break;
						}
					}
				}
			}
			viaje.fechaInicio = moment(viaje.fechaInicio).format("YYYY-MM-DD hh:mm:ss");
			viaje.fechaFin    = moment(viaje.fechaFin   ).format("YYYY-MM-DD hh:mm:ss");
		}
		return res.status(201).json({
			success: true,
			score: nScoreGlobal,
			kms : nKmsGlobal,
			conductores: arrConductor,
			eventos: eventoSum,
			viajes : arrViaje
		});
	} catch(e){
		console.log(e.stack);
		return res.status(500).json({ success: false, code:2026, message: "Error inesperado al leer Viajes", errors: [ {code: 2027, message: e.message }]});
	} });
	} catch(e){
		console.log(e.stack);
		return res.status(500).json({ success: false, code:2030, message: "Error inesperado al leer Vehiculos", errors: [ {code: 2032, message: e.message }]});
	} });
	} catch(e){
		console.log(e.stack);
		return res.status(500).json({ success: false, code:2036, message: "Error inesperado al leer Conductores", errors: [ {code: 2038, message: e.message }]});
	} });
	});
};
