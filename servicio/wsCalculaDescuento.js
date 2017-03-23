const db = require("../db/db");
const moment = require("moment");

module.exports = function(req,res){
	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log(req.body);
	if(!req.body.kms) {
		return res.status(400).json({ success: false, code: 3112, message: "Falta cantidad de kilómetros [kms]." });
	}
	if(!req.body.diasUso) {
		return res.status(400).json({ success: false, code: 3114, message: "Falta cantidad de días de uso por mes [diasUso]." });
	}
	if(!req.body.diasPunta) {
		return res.status(400).json({ success: false, code: 3116, message: "Falta cantidad de días de uso en horas punta o nocturna por mes [diasPunta]." });
	}
	if(!req.body.score) {
		return res.status(400).json({ success: false, code: 3118, message: "Falta puntaje de manejo [score]." });
	}
	// Se espera que KMS sea mayor que cero y como máximo 99.999
	if( ! /^[0-9]{1,5}$/.test(req.body.kms) ) {
		return res.status(400).json({ success: false, code: 3120, message: 'Cantidad de kilómetros [kms] deber ser numérico mayor que cero y máximo 5 cifras.' });
	}
	// Se espera que diasUso sea mayor que cero y menor o igual a 31
	if( ! /^[0-9]{1,2}$/.test(req.body.diasUso) || req.body.diasUso > 31 ) {
		return res.status(400).json({ success: false, code: 3122, message: 'La cantidad de días de uso por mes [diasUso], debe ser numérico y su valor debe estar entre 0 y 31.' });
	}
	// Se espera que diasPunta sea mayor que cero y menor o igual a 31
	if( ! /^[0-9]{1,2}$/.test(req.body.diasPunta) || req.body.diasPunta > 31 ) {
		return res.status(400).json({ success: false, code: 3124, message: 'La cantidad de días de uso por mes en hora punta [diasPunta], debe ser numérico y su valor debe estar entre 0 y 31.' });
	}
	// Se espera que score sea mayor que cero y menor o igual a 100
	if( ! /^[0-9]{1,3}$/.test(req.body.score) || req.body.score> 100 ) {
		return res.status(400).json({ success: false, code: 3126, message: 'El puntjae de manejo [score], debe ser numérico y su valor debe estar entre 0 y 100.' });
	}	
	// Dias del mes no es obligatorio, pero si se ingrese, se espera que diasMes sea mayor que cero y menor o igual a 31
	if( req.body.diasMes && ( ! /^[0-9]{1,2}$/.test(req.body.diasMes) || req.body.diasMes > 31 )) {
		return res.status(400).json({ success: false, code: 3128, message: 'La cantidad de días del mes [diasMes], debe ser numérico y su valor debe estar entre 0 y 31.' });
	}
	// Dias de vigencia dentro del mes no es obligatorio, pero si se ingrese, se espera que diasMes sea mayor que cero y menor o igual a 31
	if( req.body.diasVigencia && ( ! /^[0-9]{1,2}$/.test(req.body.diasVigencia) || req.body.diasVigencia > 31 )) {
		return res.status(400).json({ success: false, code: 3130, message: 'La cantidad de días de vigencia dentro del mes [diasVigencia], debe ser numérico y su valor debe estar entre 0 y 31.' });
	}

	var nKms			= parseInt(req.body.kms);
	var nDiasUso		= parseInt(req.body.diasUso);
	var nDiasPunta		= parseInt(req.body.diasPunta);
	var nScore			= parseInt(req.body.score);
	var nDiasMes		= 30;
	var nDiasVigencia	= 30;

	if( req.body.diasMes )
		nDiasMes = parseInt(req.body.diasMes);
	if( req.body.diasVigencia )
		nDiasVigencia = parseInt(req.body.diasVigencia);

	if( nDiasUso < nDiasPunta ){
		return res.status(400).json({ success: false, code: 3132, message: 'La cantidad de días de uso en el mes no puede ser inferior a los días de uso en hora punta.' });
	}
	if( nDiasUso > nDiasMes ){
		return res.status(400).json({ success: false, code: 3134, message: 'La cantidad de días de uso en el mes no puede exceder la cantidad de días del mes.' });
	}
	if( nDiasVigencia > nDiasMes ){
		return res.status(400).json({ success: false, code: 3136, message: 'La cantidad de días de vigencia no puede exceder la cantidad de días del mes.' });
	}

    var qIdViaje = db.scoreDB.knex.raw("select fnCalculaDescuento(?,?,?,?,?,?) descuento",[ nKms, nDiasUso, nDiasPunta, nScore, nDiasMes, nDiasVigencia ])
	.then(function( data ){
	if (data === null || data.length == 0 ) {
		return res.status(400).json({ success: false, code: 3144, message: "Error al ejecutar llamada la función fnCalculaDescuento" });
	}
	try {
		return res.status(201).json(data[0][0]);
	} catch(e){
		console.log(e.stack);
		return res.status(500).json({ success: false, code: 3150, message: "Error inesperado al ejecutar fnCalculaDescuento", errors: [ {code: 3152, message: e.message }]});
	} });
};
