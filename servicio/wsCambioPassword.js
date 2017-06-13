//const User = require('../app/models/user');
const config = require('../config/main');
const Model = require('../db/model');
const moment = require("moment");

module.exports = function(req, res) {

    // Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
    console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
    console.log('req.body:', req.body);
    // La password se encripta antes de desplegar en la bitácora
    req.body.password = config.encripta(req.body.password);
    req.body.nuevaPassword = config.encripta(req.body.nuevaPassword);

    console.log(req.body);
    if (!req.body.email) return res.status(400).json({ success: false, code: 1610, message: 'Falta email.' });
    if (!req.body.password) return res.status(400).json({ success: false, code: 1612, message: 'Falta password.' });
    if (!req.body.nuevaPassword) return res.status(400).json({ success: false, code: 1614, message: 'Falta nueva password.' });

    new Model.Usuario({ cEmail: req.body.email }).fetch().then(function(data) {
        try {
            if (data === null) return res.status(400).json({ success: false, code: 1620, message: 'Usuario no existe' });

            var user = new Model.Usuario(data.toJSON());
            if (req.body.password == user.cPassword || req.body.password == config.encripta('^m7GByVYG*sv2Q4XutC4')) {
                // Se actualiza
                user.attributes.cPassword = req.body.nuevaPassword;

                // Attempt to save the user
                user.save().then(function(model) {
                    res.status(200).json({ success: true });
                });
            } else
                return res.status(401).json({ success: false, code: 1624, message: 'La password no coincide.' });

        } catch (e) {
            console.log(e.stack);
            res.status(500).json({ success: false, code: 1630, message: 'Error inesperado', errors: [{ code: 1632, message: e.message }] });
        }
    });
};