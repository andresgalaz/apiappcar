const db = require("../db/db");
const moment = require("moment");

module.exports = function(req, res) {
    // Registra el virloc a la patente ingresada
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log(req.body);
    if (!req.body.opcion) {
        return res.status(400).json({ success: false, code: 3510, message: 'Falta parámetro `opción`.' });
    }
    if (!req.body.estado) {
        return res.status(400).json({ success: false, code: 3512, message: 'Falta estado.' });
    }
    if (!req.body.id) {
        return res.status(400).json({ success: false, code: 3514, message: 'Falta ID. de dispositivo.' });
    }
    if (req.body.opcion.length > 20) {
        return res.status(400).json({ success: false, code: 3516, message: 'Opción no válida.' });
    }
    if (req.body.estado.length > 20) {
        return res.status(400).json({ success: false, code: 3518, message: 'Estado no válido.' });
    }
    if (req.body.id.length > 50) {
        return res.status(400).json({ success: false, code: 3520, message: 'ID. de dispositivo no válido.' });
    }
    if (req.body.patente && req.body.patente.length > 20) {
        return res.status(400).json({ success: false, code: 3522, message: 'Patente no válida.' });
    }
    if (req.body.num_instalacion && req.body.num_instalacion.length > 20) {
        return res.status(400).json({ success: false, code: 3524, message: 'Nº instalación no válido.' });
    }

    var arrPrm = [req.user.pUsuario, req.body.opcion, req.body.estado, req.body.id, req.body.patente, req.body.num_instalacion];
    console.log(arrPrm);
    db.scoreDB.knex.raw("call prInstalacion(?,?,?,?,?,?)", arrPrm)
        .then(function(data) {
            try {
                var arr = data[0][0][0];
                if (arr.nCodigo == 0)
                    return res.status(201).json({ success: true });
                if (arr.nCodigo > 0)
                    return res.status(400).json({ success: false, code: arr.nCodigo, message: arr.cMensaje });
                return res.status(400).json({ success: false, code: 3526, message: 'Error inesperado al recibir resultado' });
            } catch (e) {
                console.log(e.stack);
                return res.status(500).json({ success: false, code: 3528, message: "Error inesperado al procesar estado de instalación" + e.message });
            }
        });
};