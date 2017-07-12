const db = require("../db/db");
const moment = require("moment");

module.exports = function(req, res) {
    const Util = require("../util");

    // Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log('req.user:', req.user);
    console.log(req.body);

    // Valida parámetros
    var nIdViaje = null,
        nIdEvento = null;
    if (req.body.idViaje) {
        nIdViaje = parseInt(req.body.idViaje);
        if (isNaN(nIdViaje))
            return res.status(400).json({ success: false, code: 3310, message: "Identificador del viaje debe ser numérico." });
        if (nIdViaje <= 0)
            return res.status(400).json({ success: false, code: 3312, message: "Identificador del viaje debe ser mayor que cero." });
    }
    if (req.body.idEvento) {
        nIdEvento = parseInt(req.body.idEvento);
        if (isNaN(nIdEvento))
            return res.status(400).json({ success: false, code: 3314, message: "Identificador del evento debe ser numérico." });
        if (nIdEvento <= 0)
            return res.status(400).json({ success: false, code: 3316, message: "Identificador del evento debe ser mayor que cero." });
    }
    if (nIdViaje == null && nIdEvento == null)
        return res.status(400).json({ success: false, code: 3318, message: "Debe indicar identificador de Viaje o Evento." });

    // Arama consulta de eventos
    var qEvento = db.scoreDB.knex("vEvento")
        .select("nIdObservation as id", "nIdViaje as idViaje", "fTpEvento as idEvento", "cEvento as tipoEvento", "tEvento as ts",
            "nLT as LT", "nLG as LG", "nValor as valor", "nValorG as valor_g", "cDescripcion as descripcion",
            "nVelocidadMaxima as velocidadMaxima", "cCalle as calle", "cCalleCorta as calleCorta", "nNivelApp as nivel")
        .whereIn("fTpEvento", [3, 4, 5, 6]);
    if (nIdViaje != null)
        qEvento.andWhere("nIdViaje", nIdViaje);
    if (nIdEvento != null)
        qEvento.andWhere("nIdObservation", nIdEvento);
    qEvento.orderBy("tEvento");

    // Ejecuta la consulta de eventos
    qEvento.then(function(arrEventoViaje) {
        try {
            for (var i = 0; i < arrEventoViaje.length; i++) {
                var eventoViaje = Util.borraPropiedadNula(arrEventoViaje[i]);
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
            return res.status(500).json({ success: false, code: 3340, message: "Error inesperado al leer eventos del viaje", errors: [{ code: 3342, message: e.message }] });
        }
    });
};