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
		version: 2,
		params: [
			  '>VS16,0,9999,1330,1150,9999,100,100,100,60,0,128,0,900,480,25<'
			, '>VS08,1C,5,5<'
			, '>VS16,20,500,500,500,-500,-500,-500<'
			, '>VS16,C0,50,150,80,200,2565,2570,100<'
			, '>VS16,CE,470,280,1000,-470,-600,-1000,500,300,1000,-500,-650,-1000,600,350,1200,-600,-800,-1200<'
			, '>VS16,F2,771<'
			, '>VS08,F2,3,3,5,3,3,5,20,20,20,20,20,20<'
			, '>VS16,10A,130,131,145,200,50,100,50,1025,3000<'
			, '>VR32H144,00004F5A,00000000,00000000,0000F138;ID=0000;#8010;*19<'
			, ''
			, '>GCS,00004F5A,00000000,00000000,0000F138,00014092 1111<'
		]
	};
	return res.status(200).json(oOut);
};
