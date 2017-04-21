const Model = require('../db/model');
const config = require('../config/main');
const jwt = require('jsonwebtoken');
const moment = require("moment");

module.exports = function (req, res) {
	const Util = require('../util');

	// Devuelve la url de los parámetros para el VIRLOC
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:', req.user);
	console.log(req.body);
	if(!req.body.idVehiculo) {
		return res.status(400).json({ success: false, code: 2810, message: 'Falta id. de vehículo.' });
	}
	var oOut = {
		version: 3,
		umbral: 300,
		params: [
			  '>VS16,14,3600<'
			, '>VS16,16,60<'
			, '>VS16,18,32<'
			, '>VS08,F8,40<'
			, '>VS08,F9,40<'
			, '>VS08,FA,40<'
			, '>VS08,FB,40<'
			, '>VS08,FC,40<'
			, '>VS08,FD,40<'
		]
	};
	return res.status(200).json(oOut);
};
