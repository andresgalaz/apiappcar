const db = require("../db/db");
const Model = require('../db/model');
const token = require('../herr/generaToken');
const moment = require("moment");

module.exports = function(req, res) {
    // Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log('req.user:', req.user);
    new Model.UsuarioVeh({ pUsuario: req.user.pUsuario }).fetch({ withRelated: ['vehiculos'] }).then(function(data) {
        try {
            var user = data;
            if (user === null)
                return res.status(401).json({ success: false, code: 1510, message: 'Usuario no existe' });
            user = data.toJSON();
            db.scoreDB.knex.raw("select fnUsuarioPerfil(?,?) as bPermiso", [req.user.cEmail, req.user.cPerfil]).then(function(data) {
                var bPermiso = data[0][0].bPermiso;
                if (bPermiso == 1) {
                    user.cPerfil = req.user.cPerfil;
                    return res.status(200).json(token.genera(user, req.user.nDuracionToken));
                }
                return res.status(401).json({ success: false, code: 1512, message: 'Usuario no está autorizado para utilizar la aplicación' });
            });
        } catch (e) {
            console.log(e);
            return res.status(401).json({ success: false, code: 1520, message: 'Error inesperado.' });
        }
    });
};