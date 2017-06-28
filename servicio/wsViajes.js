const db = require("../db/db");
const moment = require("moment");

module.exports = function(req, res) {
    const Util = require("../util");

    // Lista los viajes de un usuario
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log('req.user:', req.user);
    console.log(req.body);
    var nPeriodo = null,
        nPagina = 0,
        cFecIni = null,
        cFecFin = null;
    if (req.body.periodo) {
        nPeriodo = parseInt(req.body.periodo);
        if (isNaN(nPeriodo))
            return res.status(400).json({ success: false, code: 3610, message: "Periodo debe se numérico." });
        if (nPeriodo > 0)
            return res.status(400).json({ success: false, code: 3612, message: "Periodo debe ser negativo" });
    } else {
        if (!req.body.fechaInicio || !req.body.fechaFin)
            return res.status(400).json({ success: false, code: 3616, message: "Se debe indicar periodo o rango de fechas." });
        var dIni = moment(req.body.fechaInicio, "YYYY-MM-DD");
        if (!dIni.isValid()) {
            return res.status(400).json({ success: false, code: 3618, message: "Fecha de inicio no válica." });
        }
        var dFin = moment(req.body.fechaFin, "YYYY-MM-DD");
        if (!dFin.isValid()) {
            return res.status(400).json({ success: false, code: 3620, message: "Fecha de fin no válica." });
        }
        if (dIni > dFin) {
            return res.status(400).json({ success: false, code: 3622, message: "La fecha de inicio debe ser anterior a la fecha de fin." });
        }
        cFecIni = dIni.format("YYYY-MM-DD");
        cFecFin = dFin.format("YYYY-MM-DD");
    }

    if (req.body.pagina) {
        nPagina = parseInt(req.body.pagina);
        if (isNaN(nPagina))
            return res.status(400).json({ success: false, code: 3624, message: "Periodo debe se numérico." });
        if (nPagina <= 0)
            return res.status(400).json({ success: false, code: 3626, message: "Periodo debe ser mayor que cero" });
    }
    console.log([req.user.pUsuario, nPagina, nPeriodo, cFecIni, cFecFin]);
    db.scoreDB.knex.raw("call prViajesRangoFecha(?,?,?,?,?)", [req.user.pUsuario, nPagina, nPeriodo, cFecIni, cFecFin]).then(function(data) {
        if (data === null) {
            return res.status(400).json({ success: false, code: 3624, message: "Error al ejecutar consulta de viajes" });
        }
        try {
            // Cursor-1 trae la información de fechas usadas, cantidad de registros / páginas
            var arrTotal = data[0][0][0];
            var arrViaje = [];
            if (arrTotal.nRegs > 0) {
                // Si hay registros
                // Cursor-2 trae un arreglo de vehículos
                var arr = data[0][1];
                // Inicializa Acumuladores para los viajes
                for (var i = 0; i < arr.length; i++) {
                    if (!arr[i].cCalleInicio) delete arr[i].cCalleInicio;
                    if (!arr[i].cCalleFin) delete arr[i].cCalleFin;
                    arrViaje.push({
                        idViaje: arr[i].nIdViaje,
                        idVehiculo: arr[i].fVehiculo,
                        patente: arr[i].cPatente,
                        calleInicio: arr[i].cCalleInicio,
                        calleFin: arr[i].cCalleFin,
                        fechaInicio: arr[i].tInicio,
                        fechaFin: arr[i].tFin,
                        duracion: arr[i].nDuracionSeg,
                        score: arr[i].nScore,
                        kms: arr[i].nKms,
                        eventos: db.convertEventos(arr[i])
                    });
                };
            }
            // Entrega resultado
            return res.status(201).json({
                success: true,
                fechaInicio: arrTotal.dInicio,
                fechaFin: arrTotal.dFin,
                paginaActual: arrTotal.nPagina,
                paginas: arrTotal.nPaginas,
                viajes: arrViaje
            });
        } catch (e) {
            console.log(e.stack);
            return res.status(500).json({ success: false, code: 3634, message: "Error inesperado al leer vehiculos", errors: [{ code: 3638, message: e.message }] });
        }
    });
};