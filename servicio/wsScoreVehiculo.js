const db = require("../db/db");
const moment = require("moment");

module.exports = function(req, res) {
    const Util = require("../util");

    // Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log('req.user:', req.user);
    console.log(req.body);
    var nPeriodo = null,
        nIdVehiculo = null,
        nIdConductor,
        cFecIni = null,
        cFecFin = null;
    if (req.body.periodo) {
        nPeriodo = parseInt(req.body.periodo);
        if (isNaN(nPeriodo))
            return res.status(400).json({ success: false, code: 2010, message: "Periodo debe se numérico." });
        if (nPeriodo > 0)
            return res.status(400).json({ success: false, code: 2012, message: "Periodo debe ser negativo" });
    } else {
        if (!req.body.fechaInicio || !req.body.fechaFin)
            return res.status(400).json({ success: false, code: 2016, message: "Se debe indicar periodo o rango de fechas." });
        var dIni = moment(req.body.fechaInicio, "YYYY-MM-DD");
        if (!dIni.isValid()) {
            return res.status(400).json({ success: false, code: 2018, message: "Fecha de inicio no válica." });
        }
        var dFin = moment(req.body.fechaFin, "YYYY-MM-DD");
        if (!dFin.isValid()) {
            return res.status(400).json({ success: false, code: 2020, message: "Fecha de fin no válica." });
        }
        if (dIni > dFin) {
            return res.status(400).json({ success: false, code: 2022, message: "La fecha de inicio debe ser anterior a la fecha de fin." });
        }
        cFecIni = dIni.format("YYYY-MM-DD");
        cFecFin = dFin.format("YYYY-MM-DD");
    }
    if (req.body.idVehiculo) {
        nIdVehiculo = parseInt(req.body.idVehiculo);
        if (isNaN(nIdVehiculo))
            return res.status(400).json({ success: false, code: 2010, message: "Id. Vehículo debe ser numérico." });
        if (nIdVehiculo <= 0)
            return res.status(400).json({ success: false, code: 2012, message: "Id. Vehículo debe ser mayor que cero" });
    }
    if (req.body.idUsuario) {
        nIdConductor = parseInt(req.body.idUsuario);
        if (isNaN(nIdConductor))
            return res.status(400).json({ success: false, code: 2010, message: "Id. Usuario debe ser numérico." });
        if (nIdConductor <= 0)
            return res.status(400).json({ success: false, code: 2012, message: "Id. Usuario debe ser mayor que cero" });
    }

    db.scoreDB.knex.raw("call prScoreVehiculoRangoFecha(?,?,?,?,?,?)", [req.user.pUsuario, nPeriodo, cFecIni, cFecFin, nIdVehiculo, nIdConductor]).then(function(data) {
        if (data === null) {
            return res.status(400).json({ success: false, code: 2024, message: "Error al ejecutar consulta Score de Vehiculos" });
        }
        try {
            // Cursor-1 trae la información global de todos los vehículos
            var arr = data[0][0];
            var nKmsGlobal = arr[0].nKmsTotal;
            var nScoreGlobal = arr[0].nScoreGlobal;

            // Cursor-2 trae un arreglo de vehículos
            arr = data[0][1];
            // Inicializa Acumuladores para los viajes
            var arrVeh = [];
            for (var i = 0; i < arr.length; i++) {
                if (!arr[i].tUltimoRegistro)
                    arr[i].tUltimoRegistro = arr[i].dInicio + 'T00:00:00.000Z';
                if (!arr[i].tUltimaSincro) {
                    arr[i].tUltimaSincro = arr[i].tUltimoRegistro;
                    arr[i].cEstadoSincroTrans = arr[i].cEstadoSincroTrips;
                }
                arrVeh.push({
                    idVehiculo: arr[i].pVehiculo,
                    patente: arr[i].cPatente,
                    idTitular: arr[i].fUsuarioTitular,
                    titular: arr[i].cNombre,
                    fechaInicio: arr[i].dInicio,
                    fechaFin: arr[i].dFin,
                    kms: arr[i].nKms,
                    score: arr[i].nScore,
                    descuento: arr[i].nDescuento,
                    cantidadViajes: arr[i].nQViajes,
                    ultimoRegistro: arr[i].tUltimoRegistro,
                    ultimaSincro: arr[i].tUltimaSincro,
                    estadoSincro: arr[i].cEstadoSincroTrans
                });
            }
            // Cursor-3 trae los eventos graves x vehículo
            arr = data[0][2];
            for (var i = 0; i < arrVeh.length; i++) {
                for (var j = 0; j < arr.length; j++) {
                    if (arrVeh[i].idVehiculo == arr[j].pVehiculo) {
                        arrVeh[i].eventos = db.convertEventos(arr[j]);
                        break;
                    }
                }
                // No tiene eventos, los pone en cero para que los de Mobiltonic no jodan con que en la APP es muy dificil, digo yo para que se meten en temas que después son muy dificiles, es mejor que aprendan a programar y se dejen de quejar, o se dediquen a otra cosa.
                if (!arrVeh[i].eventos)
                    arrVeh[i].eventos = db.convertEventos({})
                Util.borraPropiedadNula(arrVeh[i]);
            }
            // Cursor-4 trae los conductores que pueden conducir cada vehículo, este resumen de lo anterior se envía porque al parecer el equipo de Mobiltonic no saben hacer un ciclo FOR para sumar un array
            arr = data[0][3];
            // Inicializa Acumuladores para los viajes
            for (var i = 0; i < arrVeh.length; i++) {
                var veh = arrVeh[i];
                veh.conductores = [];
                for (var j = 0; j < arr.length; j++) {
                    var conductor = arr[j];
                    if (veh.idVehiculo == conductor.pVehiculo) {
                        var oKmScore = JSON.parse(conductor.cJsonKmScore);
                        veh.conductores.push(Util.borraPropiedadNula({
                            idConductor: conductor.pUsuario,
                            conductor: conductor.cUsuario,
                            kms: oKmScore.nKms,
                            score: oKmScore.nScore
                        }));
                    }
                }
            }
            // Cursor-5, resumen de los eventos del vehículo, este resumen de lo anterior se envía porque al parecer el equipo de Mobiltonic no saben hacer un ciclo FOR para sumar un array
            var arr = data[0][4];
            var arrEventos = db.convertEventos(arr[0]);
            // Cursor-6, detalle de viajes
            arr = data[0][5];
            var arrViaje = [];
            for (var i = 0; i < arr.length; i++) {
                arrViaje.push(Util.borraPropiedadNula({
                    idViaje: arr[i].nIdViaje,
                    idVehiculo: arr[i].fVehiculo,
                    patente: arr[i].cPatente,
                    calleInicio: arr[i].cCalleInicio,
                    calleFin: arr[i].cCalleFin,
                    calleCortaInicio: arr[i].cCalleCortaInicio,
                    calleCortaFin: arr[i].cCalleCortaFin,
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
            // Inicializa Acumuladores para los viajes
            return res.status(201).json({
                success: true,
                score: nScoreGlobal,
                kms: nKmsGlobal,
                vehiculos: arrVeh,
                viajes: arrViaje,
                eventos: arrEventos
            });
        } catch (e) {
            console.log(e.stack);
            return res.status(500).json({ success: false, code: 2034, message: "Error inesperado al leer vehiculos", errors: [{ code: 2038, message: e.message }] });
        }
    });
};