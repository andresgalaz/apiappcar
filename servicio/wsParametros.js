const Model = require('../db/model');
const config = require('../config/main');
const jwt = require('jsonwebtoken');
const moment = require("moment");

module.exports = function (req, res) {
	const Util = require('../util');

	// Devuelve la url de los parámetros para el VIRLOC
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:', req.user);
	var oOut = {
		version: 1,
		params: {
			aceleracion: 12,
			frenada: 14
		}
	};
	return res.status(200).json(oOut);
};
//