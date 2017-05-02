const Model = require('../db/model');
const config = require('../config/main');
const token = require('../herr/generaToken');
const moment = require("moment");

module.exports = function(req, res) {

    // Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log(req.body);

    new Model.UsuarioVeh({ cEmail: req.body.email }).fetch({ withRelated: ['vehiculos'] }).then(function(data) {
        try {
            var user = data;
            if (user === null) {
                return res.status(401).json({ success: false, code: 3210, message: 'Usuario no existe' });
            } else {
                user = data.toJSON();
                return res.status(200).json(token.genera(user, 60));
            }
        } catch (e) {
            console.log(e);
            return res.status(401).json({ success: false, code: 3220, message: 'Error inesperado.' });
        }
    });
};
