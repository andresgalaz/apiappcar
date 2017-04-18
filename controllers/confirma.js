const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');
const email = require('../config/emailServer');
const pug = require('pug');

module.exports = function (req, res) {
    if (req.body.id && req.body.acepta === '1') {

        var hashId = new Hash(config.secret);
            id = req.body.id,
            idDecoded = String(hashId.decode(id)).slice(9),
            newUsuario = new Model.Usuario({ pUsuario: idDecoded }),
            mensaje = '';

        newUsuario
            .fetch()
            .then(function (data) {
                try {
                    if (data.attributes.bConfirmado === '1') {
                        mensaje = 'confirmado';
                    } else {
                        this.save({ bConfirmado: '1' }, { patch: true })
                            .then(function (data) {
                                if (data === null) {
                                    mensaje = 'error';
                                    return res.status(200).json(mensaje);
                                } else {
                                    mensaje = 'exito';
                                    return res.status(200).json(mensaje);
                                }
                            });
                    }
                } catch (err) {
                    console.log(err);
                    mensaje = 'error';
                    return res.status(400).json(mensaje);
                }
            });
    } else {
        const cEmailBody = pug.compileFile('views/emailRegistro.pug');

        email.server.send({
            from: 'SnapCar <no-responder@snapcar.com.ar>',
            to: req.body.email,
            subject: 'Confirme su registro',
            attachment: [{
                data: cEmailBody({
                    nombreUsuario: req.body.nombre,
                    idRegistro: req.body.id,
                    emailRegistro: req.body.email,
                    baseUrl: req.protocol + '://' + req.headers.host
                }),
                alternative: true
            }]
        }, function (err, message) { console.log(err || message); });

        mensaje = 'no confirma'
        return res.status(200).json(mensaje);
    }
};