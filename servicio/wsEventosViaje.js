const db = require("../db/db");
const moment = require("moment");

module.exports = function(req, res) {
    const Util = require("../util");

    // Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log('req.user:', req.user);
    console.log(req.body);
    if (!req.body.idViaje) {
        return res.status(400).json({ success: false, code: 2110, message: "Falta identificador del viaje." });
    }
    // Lista Eventos
    db.scoreDB.knex("vEvento")
        .select("nIdObservation as id", "fTpEvento as idEvento", "cEvento as tipoEvento", "tEvento as ts",
            "nLT as LT", "nLG as LG", "nValor as valor", "nValorG as valor_g", "cDescripcion as descripcion",
            "nVelocidadMaxima as velocidadMaxima", "cCalle as calle", "cCalleCorta as calle_corta", "nNivelApp as nivel")
        .whereIn("fTpEvento", [3, 4, 5, 6])
        .andWhere("nIdViaje", req.body.idViaje)
        .then(function(arrEventoViaje) {
            try {
                for (var i = 0; i < arrEventoViaje.length; i++) {
                    var eventoViaje = arrEventoViaje[i];
                    if (eventoViaje.idEvento != 5) {
                        eventoViaje.valor = Math.round(eventoViaje.valor);
                        delete eventoViaje['velocidadMaxima'];
                    } else {
                        // Se trunca al techo del valor, así si la máxima es 40 km/h y el evento tiene como 
                        // valor 40.001 km/h, se pasa a 41 km/h.
                        eventoViaje.valor = Math.ceil(eventoViaje.valor);
                    }
                }
                return res.status(201).json({
                    success: true,
                    eventos: arrEventoViaje
                });
            } catch (e) {
                console.log(e.stack);
                return res.status(500).json({ success: false, code: 2120, message: "Error inesperado al leer eventos del viaje", errors: [{ code: 2121, message: e.message }] });
            }
        });
};