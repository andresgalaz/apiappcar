const config = require('../config/main');
const moment = require("moment");

module.exports = function(req, res) {
    // Solo se usa para devolver la password encriptada
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    // La password se encripta antes de desplegar en la bitácora
    req.body.password = config.encripta(req.body.password);
    console.log('req.body:', req.body);
    if (!req.body.password)
		return res.status(400).json({ success: false, code: 1612, message: 'Falta password.' });

    res.status(200).json({ success: true, password: req.body.password });
};
