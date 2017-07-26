const db = require("../db/db");
const moment = require("moment");

module.exports = function(req, res) {
    // Registra el firmware del virloc 
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log(req.body);
    if (!req.body.idVehiculo) {
        return res.status(400).json({ success: false, code: 3710, message: 'Falta id. de vehículo.' });
    }
    if (!req.body.firmware) {
        return res.status(400).json({ success: false, code: 3714, message: 'Falta id. de firmware.' });
    }
    if (!req.body.idDispositivo) {
        return res.status(400).json({ success: false, code: 3716, message: 'Falta id. del dispositivo (Virloc)' });
    }

    var nIdVehiculo = parseInt(req.body.idVehiculo);
    if (isNaN(nIdVehiculo))
        return res.status(400).json({ success: false, code: 3718, message: "Id. de vehículo debe se numérico." });
    if (nIdVehiculo <= 0)
        return res.status(400).json({ success: false, code: 3720, message: "Id. de vehículo ser mayor que cero" });

    db.scoreDB.knex.raw("call prFirmwareEstado(?,?,?)", [nIdVehiculo, req.body.firmware, req.body.idDispositivo])
        .then(function(data) {
            try {
                // Solo hay un solo cursor
                var arr = data[0][0][0];
                if (arr.nCodigo == 0) {
                    var oResp = { success: true };
                    return res.status(201).json(oResp);
                }
                if (arr.nCodigo > 0)
                    return res.status(400).json({ success: false, code: arr.nCodigo, message: arr.cMensaje });
                return res.status(400).json({ success: false, code: 3722, message: 'Error inesperado al recibir resultado' });
            } catch (e) {
                console.log(e.stack);
                return res.status(500).json({ success: false, code: 3724, message: "Error inesperado al procesar estado de instalación" + e.message });
            }
        });
};