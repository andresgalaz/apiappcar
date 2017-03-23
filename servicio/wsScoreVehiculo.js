const db = require("../db/db");
const moment = require("moment");

module.exports = function(req, res) {
    const Util = require("../util");

    // Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log('req.user:', req.user);
    console.log(req.body);
    if (!req.body.fechaInicio || !req.body.fechaFin) {
        return res.status(400).json({ success: false, code: 2012, message: "Falta rango de fechas." });
    }
    var dIni = moment(req.body.fechaInicio, "YYYY-MM-DD");
    if (!dIni.isValid()) {
        return res.status(400).json({ success: false, code: 2013, message: "Fecha de inicio no válica." });
    }
    var dFin = moment(req.body.fechaFin, "YYYY-MM-DD");
    if (!dFin.isValid()) {
        return res.status(400).json({ success: false, code: 2014, message: "Fecha de fin no válica." });
    }
    if (dIni > dFin) {
        return res.status(400).json({ success: false, code: 2015, message: "La fecha de inicio debe ser anterior a la fecha de fin." });
    }

    // Lista score
    var objEventosPorViaje = {};
    var arrVeh = [];
    var nDescuentoGlobal = 0;
    var nScoreGlobal = 0;
    var nKmsGlobal = 0;

    var eventoSum = [
        { "idEvento": "3", "tipoEvento": "Aceleración", "cantidad": 0 },
        { "idEvento": "4", "tipoEvento": "Frenada", "cantidad": 0 },
        { "idEvento": "5", "tipoEvento": "Exceso Velocidad", "cantidad": 0 }
    ];

    var qIdViaje = db.scoreDB.knex("vViaje")
        .select("nIdViaje")
        .where("tInicio", ">=", req.body.fechaInicio)
        .andWhere("tInicio", "<=", req.body.fechaFin);
    var qVeh = db.scoreDB.knex("vVehiculo")
        .distinct("fUsuarioTitular as idTitular", "cUsuarioTitular as titular", "fVehiculo as idVehiculo", "cPatente as patente", "nKms as kms", "nScore as score", "nDescuento as descuento")
        .select()
        // Trunca el dia de la fecha y lo pne en 01 para tomar solo el periodo
        .where("dPeriodo", "=", req.body.fechaInicio.substr(0, 8) + '01');
    var qConductor = db.scoreDB.knex("vScoreMesConductor")
        .select("fUsuario as idConductor", "cUsuario as conductor", "fVehiculo as idVehiculo", "nKms as kms", "nScore as score")
        .where(function() {
            this.where('fUsuarioTitular', req.user.pUsuario).orWhere('fUsuario', req.user.pUsuario)
        })
        // Trunca el dia de la fecha y lo pne en 01 para tomar solo el periodo
        .andWhere("dPeriodo", "=", req.body.fechaInicio.substr(0, 8) + '01');
    var qViaje = db.scoreDB.knex("vViaje")
        .select("nIdViaje as idViaje", "fVehiculo as idVehiculo", "cPatente as patente", "cCalleInicio as calleInicio", "cCalleFin as calleFin", "tInicio as fechaInicio", "tFin as fechaFin", "nScore as score", "fUsuarioTitular as idTitular", "cNombreTitular as titular", "fUsuario as idConductor", "cNombreConductor as conductor", "nKms as kms")
        .where("tInicio", ">=", req.body.fechaInicio)
        .andWhere("tInicio", "<=", req.body.fechaFin);

    /*
     * Si se indica usuario se filtra por los usuarios que tienen acceso al vehiculo.
     * Si el usuario no coincide con el del Token, se filtra por usuario titular.
     */
    if (req.body.idUsuario !== undefined) {
        qIdViaje.andWhere("fUsuario", req.body.idUsuario);
        qVeh.andWhere("fUsuario", req.body.idUsuario);
        qViaje.andWhere("fUsuario", req.body.idUsuario);
        if (req.body.idUsuario != req.user.pUsuario) {
            qIdViaje.andWhere("fUsuarioTitular", req.user.pUsuario);
            qVeh.andWhere("fUsuarioTitular", req.user.pUsuario);
            qViaje.andWhere("fUsuarioTitular", req.user.pUsuario);
        }
    } else {
        // qIdViaje.andWhere("fUsuarioTitular", req.user.pUsuario);
        // qVeh.andWhere("fUsuarioTitular", req.user.pUsuario);
        // qViaje.andWhere("fUsuarioTitular", req.user.pUsuario);
        qIdViaje.andWhere(function() {
            this.where('fUsuarioTitular', req.user.pUsuario).orWhere('fUsuario', req.user.pUsuario)
        });
        qVeh.andWhere(function() {
            this.where('fUsuarioTitular', req.user.pUsuario).orWhere('fUsuario', req.user.pUsuario)
        });
        qViaje.andWhere(function() {
            this.where('fUsuarioTitular', req.user.pUsuario).orWhere('fUsuario', req.user.pUsuario)
        });
    }

    if (req.body.idVehiculo !== undefined) {
        qIdViaje.andWhere("fVehiculo", req.body.idVehiculo);
        qVeh.andWhere("fVehiculo", req.body.idVehiculo);
        qConductor.andWhere("fVehiculo", req.body.idVehiculo);
        qViaje.andWhere("fVehiculo", req.body.idVehiculo);
    }

    // Cursor de viajes a buscar para obtener el resumen de eventos de cada viaje
    qIdViaje.pluck('nIdViaje').then(function(id) {
            if (id === null) {
                return res.status(400).json({ success: false, code: 2018, message: "Error al ejecutar consulta de Viajes" });
            }
            try {
                for (var i = 0; i < id.length; i++) {
                    var nIdViaje = id[i] + 0;
                    db.scoreDB.knex("vEvento")
                        .select("nIdViaje as idViaje", "fTpEvento as idEvento", "cEvento as tipoEvento")
                        .count("fTpEvento as cantidad")
                        .where("nIdViaje", id[i])
                        .groupBy("fTpEvento", "cEvento").then(function(arrEventoViaje) {
                            if (arrEventoViaje.length > 0)
                                objEventosPorViaje['id_' + arrEventoViaje[0].idViaje] = arrEventoViaje;
                            for (var i = 0; i < arrEventoViaje.length; i++) {
                                var eventoViaje = arrEventoViaje[i];
                                delete eventoViaje["idViaje"];
                                var sum = eventoSum.filter(function(o) { return o.idEvento == eventoViaje.idEvento });
                                sum[0].cantidad += eventoViaje.cantidad;
                            }
                        });
                }
            } catch (e) {
                console.log(e.stack);
                return res.status(500).json({ success: false, code: 2022, message: "Error inesperado al leer eventos del viaje", errors: [{ code: 2023, message: e.message }] });

            }
        })
        // Cursor de vehiculos
        .then(function(a, b) {
            qVeh.then(function(data) {
                if (data === null) {
                    return res.status(400).json({ success: false, code: 2024, message: "Error al ejecutar consulta de Vehiculos" });
                }
                try {
                    arrVeh = data;
                    // Inicializa Acumuladores para los viajes
                    for (var i = 0; i < arrVeh.length; i++) {
                        // arrVeh[i].kms = 0;
                        nKmsGlobal += arrVeh[i].kms;
                        nScoreGlobal += arrVeh[i].score;
                        arrVeh[i].cantidadViajes = 0;
                        arrVeh[i].eventos = [{ idEvento: '3', tipoEvento: 'Aceleración', cantidad: 0 }, { idEvento: '4', tipoEvento: 'Frenada', cantidad: 0 }, { idEvento: '5', tipoEvento: "Exceso Velocidad", cantidad: 0 }];
                    }
                    nScoreGlobal = (nScoreGlobal / (arrVeh.length > 0 ? arrVeh.length : 1));

                    // Cursor de Conductores
                    qConductor.then(function(data) {
                        if (data === null) {
                            return res.status(400).json({ success: false, code: 2024, message: "Error al ejecutar consulta de Conductores" });
                        }
                        try {
                            arrConductor = data;
                            // Inicializa Acumuladores para los viajes
                            for (var i = 0; i < arrVeh.length; i++) {
                                var veh = arrVeh[i];
                                veh.conductores = [];
                                for (var j = 0; j < arrConductor.length; j++) {
                                    var conductor = arrConductor[j];
                                    if (veh.idVehiculo == conductor.idVehiculo)
                                        veh.conductores.push(conductor);
                                }
                            }

                            // Termina la busqueda de Eventos para cada viaje y se listan los viajes con todos sus datos
                            qViaje.then(function(arrViaje) {
                                if (arrViaje === null) {
                                    return res.status(400).json({ success: false, code: 2026, message: "Error al ejecutar consulta de Viajes" });
                                }
                                try {
                                    for (var nViaje = 0; nViaje < arrViaje.length; nViaje++) {
                                        var viaje = arrViaje[nViaje];
                                        viaje.kms = viaje.kms || 0;
                                        viaje.score = viaje.score || 100;
                                        viaje.eventos = [{ idEvento: '3', tipoEvento: 'Aceleración', cantidad: 0 }, { idEvento: '4', tipoEvento: 'Frenada', cantidad: 0 }, { idEvento: '5', tipoEvento: "Exceso Velocidad", cantidad: 0 }];
                                        var eventos = objEventosPorViaje['id_' + viaje.idViaje];
                                        if (eventos) {
                                            // Suma los eventos al viaje
                                            for (var iv = 0; iv < viaje.eventos.length; iv++) {
                                                for (var je = 0; je < eventos.length; je++) {
                                                    if (viaje.eventos[iv].idEvento == eventos[je].idEvento) {
                                                        viaje.eventos[iv].cantidad += eventos[je].cantidad;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        var nVehFound = -1;
                                        for (var nVeh = 0; nVeh < arrVeh.length; nVeh++) {
                                            if (arrVeh[nVeh].idVehiculo == viaje.idVehiculo) {
                                                nVehFound = nVeh;
                                                break;
                                            }
                                        }
                                        if (nVehFound >= 0) {
                                            var veh = arrVeh[nVehFound];
                                            veh.cantidadViajes++;
                                            // Suma el evento del viaje correspondiente al vehiculo
                                            for (var iv = 0; iv < viaje.eventos.length; iv++) {
                                                for (var je = 0; je < veh.eventos.length; je++) {
                                                    if (viaje.eventos[iv].idEvento == veh.eventos[je].idEvento) {
                                                        veh.eventos[je].cantidad += viaje.eventos[iv].cantidad;
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        viaje.fechaInicio = moment(viaje.fechaInicio).format("YYYY-MM-DD hh:mm:ss");
                                        viaje.fechaFin = moment(viaje.fechaFin).format("YYYY-MM-DD hh:mm:ss");
                                    }
                                    return res.status(201).json({
                                        success: true,
                                        score: nScoreGlobal,
                                        kms: nKmsGlobal,
                                        vehiculos: arrVeh,
                                        eventos: eventoSum,
                                        viajes: arrViaje
                                    });
                                } catch (e) {
                                    console.log(e.stack);
                                    return res.status(500).json({ success: false, code: 2026, message: "Error inesperado al leer Viajes", errors: [{ code: 2027, message: e.message }] });
                                }
                            });

                        } catch (e) {
                            console.log(e.stack);
                            return res.status(500).json({ success: false, code: 2030, message: "Error inesperado al leer Conductores", errors: [{ code: 2032, message: e.message }] });
                        }
                    });
                } catch (e) {
                    console.log(e.stack);
                    return res.status(500).json({ success: false, code: 2036, message: "Error inesperado al leer vehiculos", errors: [{ code: 2038, message: e.message }] });
                }
            });
        });
};