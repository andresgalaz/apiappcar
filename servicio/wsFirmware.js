const moment = require("moment");

module.exports = function(req, res) {
    const Util = require('../util');

    // Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log('req.user:', req.user);
    console.log(req.body);
    if (!req.body.idVehiculo) {
        return res.status(400).json({ success: false, code: 2910, message: 'Falta id. de vehículo.' });
    }
    var oOut = {
		version : 112,
		url : 'https://api.appcar.com.ar/VCNV500112_BIN.SFB'
    };
    return res.status(200).json(oOut);
};
