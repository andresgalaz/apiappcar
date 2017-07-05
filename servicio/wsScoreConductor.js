const db = require("../db/db");
const moment = require("moment");

module.exports = function(req, res) {
    const Util = require("../util");

    // Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log('req.user:', req.user);
    console.log(req.body);

    var nPeriodo = null,
        cFecIni = null,
        cFecFin = null;
    if (req.body.periodo) {
        nPeriodo = parseInt(req.body.periodo);
        if (isNaN(nPeriodo))
            return res.status(400).json({ success: false, code: 3310, message: "Periodo debe se numérico." });
        if (nPeriodo > 0)
            return res.status(400).json({ success: false, code: 3312, message: "Periodo debe ser negativo" });
    } else {
        if (!req.body.fechaInicio || !req.body.fechaFin) {
            return res.status(400).json({ success: false, code: 3316, message: "Falta periodo o rango de fechas." });
        }
        var dIni = moment(req.body.fechaInicio, "YYYY-MM-DD");
        if (!dIni.isValid()) {
            return res.status(400).json({ success: false, code: 3318, message: "Fecha de inicio no válica." });
        }
        var dFin = moment(req.body.fechaFin, "YYYY-MM-DD");
        if (!dFin.isValid()) {
            return res.status(400).json({ success: false, code: 3320, message: "Fecha de fin no válica." });
        }
        if (dIni > dFin) {
            return res.status(400).json({ success: false, code: 3322, message: "La fecha de inicio debe ser anterior a la fecha de fin." });
        }
        cFecIni = dIni.format("YYYY-MM-DD");
        cFecFin = dFin.format("YYYY-MM-DD");
    }
    // Lista score
    db.scoreDB.knex.raw("call prScoreConductorRangoFecha(?,?,?,?,?)", [req.user.pUsuario, null, nPeriodo, cFecIni, cFecFin])
        .then(function(data) {
            if (data === null) {
                return res.status(400).json({ success: false, code: 3330, message: "Error al ejecutar consulta Score de Conductores" });
            }
            try {
                // Primer cursor rango de fechas
                arr = data[0][0];
                var fechaInicio = arr[0].dInicio;
                var fechaFin = arr[0].dFin;

                // Segundo cursor trae un arreglo de conductores
                arr = data[0][1];
                var nKmsGlobal = 0;
                var nScoreGlobal = 0;
                var arrUsr = [];
                for (var i = 0; i < arr.length; i++) {
                    nKmsGlobal += nKmsGlobal + arr[i].nKms;
                    nScoreGlobal += nScoreGlobal + arr[i].nScore * arr[i].nKms;
                    arrUsr.push(Util.borraPropiedadNula({
                        idConductor: arr[i].pUsuario,
                        conductor: arr[i].cUsuario,
                        kms: arr[i].nKms,
                        score: arr[i].nScore,
                        cantidadViajes: arr[i].nQViajes,
                        eventos: db.convertEventos(arr[i]),
                        vehiculos: []
                    }));
                }
                if (nKmsGlobal > 0) {
                    nScoreGlobal = Math.round(nScoreGlobal / nKmsGlobal);
                } else {
                    nScoreGlobal = 100;
                }
                // Tercer cursor tare vehiculos x usuario
                arr = data[0][2];
                for (var i = 0; i < arrUsr.length; i++) {
                    for (var j = 0; j < arr.length; j++) {
                        if (arrUsr[i].idConductor == arr[j].pUsuario) {
                            arrUsr[i].vehiculos.push(Util.borraPropiedadNula({
                                idTitular: arr[j].fUsuarioTitular,
                                titular: arr[j].cUsuarioTitular,
                                idVehiculo: arr[j].pVehiculo,
                                patente: arr[j].cPatente,
                                kms: arr[j].nKms,
                                score: arr[j].nScore
                            }));
                        }
                    }
                }
                // Cuarto cursor, resumen de los eventos del usuario
                var arr = data[0][3];
                var arrEventos = db.convertEventos(arr[0]);
                // Quinto cursor, detalle de viajes
                var arr = data[0][4];
                var arrViaje = [];
                for (var i = 0; i < arr.length; i++) {
                    arrViaje.push(Util.borraPropiedadNula({
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
                        idTitular: arr[i].fUsuarioTitular,
                        titular: arr[i].cNombreTitular,
                        idConductor: arr[i].fUsuario,
                        conductor: arr[i].cNombreConductor,
                        eventos: db.convertEventos(arr[i])
                    }));
                };

                return res.status(201).json({
                    success: true,
                    fechaInicio: fechaInicio,
                    fechaFin: fechaFin,
                    score: nScoreGlobal,
                    kms: nKmsGlobal,
                    conductores: arrUsr,
                    eventos: arrEventos,
                    viajes: arrViaje
                });

            } catch (e) {
                console.log(e.stack);
                return res.status(500).json({ success: false, code: 3336, message: "Error inesperado al leer Conductores", errors: [{ code: 3340, message: e.message }] });
            }
        });
};