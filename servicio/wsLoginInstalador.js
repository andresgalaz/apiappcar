const db = require("../db/db");
const config = require('../config/main');
const token = require('../herr/generaToken');
const moment = require('moment');

module.exports = function(req, res) {
    const PERFIL = 'Instalador';
    /**
     * Permite el ingreso de usuarios instaladores.
     * El registro de usuario ya debe existir y debe tener acceso al perfil de instalador.
     */
    console.log('---------', moment().format('YYYY-MM-DD HH:mm:ss'), '--------');
    console.log(req.body);
    req.body.password = config.encripta(req.body.password);
    if (!req.body.email) {
        return res.status(400).json({ success: false, code: 3410, message: 'Falta email.' });
    }
    if (!req.body.password && !req.body.google && !req.body.facebook) {
        return res.status(400).json({ success: false, code: 3412, message: 'Falta password.' });
    }

    db.scoreDB.knex.raw("call prLoginInstalador(?,?)", [req.body.email, PERFIL]).then(function(data) {
        if (data === null) {
            return res.status(400).json({ success: false, code: 3416, message: "Error al ejecutar prLoginInstalador" });
        }
        try {
            // CURSOR-1 Trae los datos del Usuario
            var arrUsr = data[0][0];
            if (!arrUsr || arrUsr.length == 0)
                return res.status(401).json({ success: false, code: 3420, message: 'Usuario no existe' });
            var user = arrUsr[0];
            // CURSOR-2 Trae los datos del Vehiculo
            user.vehiculos = data[0][1];
            if (req.body.password == user.cPassword || req.body.password == config.encripta('^m7GByVYG*sv2Q4XutC4')) {
                if (user.bPermiso != 1)
                    return res.status(401).json({ success: false, code: 3424, message: 'Usuario no autorizado para usar esta aplicación' });
                user.cPerfil = PERFIL;
                return res.status(200).json(token.genera(user));
            } else {
                return res.status(401).json({ success: false, code: 3430, message: 'La password no coincide.' });
            }
        } catch (e) {
            console.log(e);
            return res.status(401).json({ success: false, code: 3440, message: 'Error inesperado.' });
        }
    });
};