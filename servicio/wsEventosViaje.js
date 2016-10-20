const db = require("../db/db");
const moment = require("moment");

module.exports = function(req,res){
	const Util = require("../util");

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:',req.user);
	console.log(req.body);
	if(!req.body.idViaje) {
		return res.status(400).json({ success: false, code: 2110, message: "Falta identificador del viaje." });
	}
	// Lista Eventos
	db.scoreDB.knex("vEvento")
	.select( "fTpEvento as idEvento", "cEvento as tipoEvento", "tEvento as ts",
			 "nLT as LT", "nLG as LG", "nValor as valor",
			 "nVelocidadMaxima as velocidadMaxima", "cCalle as calle")
	.where("nIdViaje", req.body.idViaje)
	.then(function( arrEventoViaje ){
		try {
			for( var i=0 ; i < arrEventoViaje.length ; i++){
				var eventoViaje = arrEventoViaje[i];
				if( eventoViaje.idEvento != 5 )
					delete eventoViaje['velocidadMaxima'];
				eventoViaje.ts = moment(eventoViaje.ts).format("YYYY-MM-DD hh:mm:ss");
			}
			return res.status(211).json({
				success: true,
				eventos : arrEventoViaje
			});
		} catch(e){
			console.log(e.stack);
			return res.status(500).json({ success: false, code:2120, message: "Error inesperado al leer eventos del viaje", errors: [ {code: 2121, message: e.message }]});
		}
	});
};
