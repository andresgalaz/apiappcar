const Model = require('../db/model');
const token = require('../herr/generaToken');
const moment = require("moment");

module.exports = function(req, res) {
    const Util = require('../util');

    // Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log('req.user:', req.user);
    new Model.UsuarioVeh({ pUsuario: req.user.pUsuario }).fetch({ withRelated: ['vehiculos'] }).then(function(data) {
        try {
            var user = data;
            if (user === null) {
                return res.status(401).json({ success: false, code: 1510, message: 'Usuario no existe' });
            } else {
                user = data.toJSON();
                // Se utiliza la misma duración del token anterior
                return res.status(200).json(token.genera(user, req.user.nDuracionToken));
            }
        } catch (e) {
            console.log(e);
            return res.status(401).json({ success: false, code: 1520, message: 'Error inesperado.' });
        }
    });
};