const db = require("../db/db");
const moment = require("moment");

module.exports = function (req, res) {
    const Util = require("../util");

    function convertEventos(ob) {
        return [{ idEvento: '3', tipoEvento: 'Aceleración', cantidad: ob.nQAceleracion }
            , { idEvento: '4', tipoEvento: 'Frenada', cantidad: ob.nQFrenada }
            , { idEvento: '5', tipoEvento: "Exceso Velocidad", cantidad: ob.nQVelocidad }
            , { idEvento: '6', tipoEvento: "Curvas", cantidad: ob.nQCurva }
        ];
    }

    // Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log('req.user:', req.user);
    console.log(req.body);
    if (!req.body.fechaInicio || !req.body.fechaFin) {
        return res.status(400).json({ success: false, code: 2012, message: "Falta rango de fechas." });
    }
    var dIni = moment(req.body.fechaInicio, "YYYY-MM-DD");
    if (!dIni.isValid()) {
        return res.status(400).json({ success: false, code: 2014, message: "Fecha de inicio no válica." });
    }
    var dFin = moment(req.body.fechaFin, "YYYY-MM-DD");
    if (!dFin.isValid()) {
        return res.status(400).json({ success: false, code: 2016, message: "Fecha de fin no válica." });
    }
    if (dIni > dFin) {
        return res.status(400).json({ success: false, code: 2018, message: "La fecha de inicio debe ser anterior a la fecha de fin." });
    }

    qVeh = db.scoreDB.knex.raw("call prScoreVehiculoRangoFecha(?,?,?)", [req.user.pUsuario, req.body.fechaInicio, req.body.fechaFin]).then(function (data) {
        if (data === null) {
            return res.status(400).json({ success: false, code: 2024, message: "Error al ejecutar consulta Score de Vehiculos" });
        }
        try {
            // El primer cursor trae la información global de todos los vehículos
            var arr = data[0][0];
            var nKmsGlobal = arr[0].nKmsTotal;
            var nScoreGlobal = arr[0].nScoreGlobal;

            // El segundo cursor trae un arreglo de vehículos
            arr = data[0][1];
            // Inicializa Acumuladores para los viajes
            var arrVeh = [];
            for (var i = 0; i < arr.length; i++) {
                arrVeh.push({
                    idVehiculo: arr[i].pVehiculo,
                    patente: arr[i].cPatente,
                    idTitular: arr[i].fUsuarioTitular,
                    titular: arr[i].cNombre,
                    kms: arr[i].nKms,
                    score: arr[i].nScore,
                    descuento: arr[i].nDescuento,
                    cantidadViajes: arr[i].nQViajes,
                    eventos: convertEventos(arr[i])
                });
            }
            // Tercer cursor trae los conductores que pueden conducir cada vehículo
            arr = data[0][2];
            // Inicializa Acumuladores para los viajes
            for (var i = 0; i < arrVeh.length; i++) {
                var veh = arrVeh[i];
                veh.conductores = [];
                for (var j = 0; j < arr.length; j++) {
                    var conductor = arr[j];
                    if (veh.idVehiculo == conductor.pVehiculo) {
                        veh.conductores.push({
                            idConductor: conductor.pUsuario,
                            conductor: conductor.cUsuario,
                            kms: conductor.nKms,
                            score: conductor.nScore
                        });
                    }
                }
            }
            // Cuarto cursor, resumen de los eventos del usuario
            var arr = data[0][3];
            var arrEventos = convertEventos(arr[0]);
            // Quinto cursor, detalle de viajes
            arr = data[0][4];
            var arrViajes = [];
            var arrViaje = [];
            for (var i = 0; i < arr.length; i++) {
                if(!arr[i].cCalleInicio) delete arr[i].cCalleInicio;
                if(!arr[i].cCalleFin) delete arr[i].cCalleFin;
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
                    idTitular: arr[i].fUsuarioTitular,
                    titular: arr[i].cNombreTitular,
                    idConductor: arr[i].fUsuario,
                    conductor: arr[i].cNombreConductor,
                    eventos: convertEventos(arr[i])
                });
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