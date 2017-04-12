const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');
const email = require('../config/emailServer');

module.exports = function (req, res) {
    if (req.body.estado) {
        var newUsuario = new Model.Usuario({ pUsuario: idDecoded });

        newUsuario
            .fetch()
            .then(function (data) {
                try {
                    if (data.attributes.bConfirmado === '1') {
                        template('confirmado');
                    } else {
                        /* Modificar */
                        this.save({ bConfirmado: '1' }, { patch: true })
                            .then(function (data) {
                                if (data === null) {
                                    template('error');
                                } else {
                                    template('exito');
                                }
                            });
                    }
                } catch (err) {
                    console.log(err);
                    template('error');
                }
            });
    } else {
        res.sendStatus(400);

        // Reenvía email de confirmación
        const cEmailBody = pug.compileFile('views/emailRegistro.pug');

        email.server.send({
            from: 'SnapCar <no-responder@snapcar.com.ar>',
            to: req.body.email,
            subject: 'Confirme su registro',
            attachment: [{
                data: cEmailBody({
                    nombreUsuario: req.body.nombre.split(' ')[0],
                    idRegistro: idRegistro,
                    baseUrl: req.protocol + '://' + req.headers.host
                }),
                alternative: true
            }]
        }, function (err, message) { console.log(err || message); });
    }

    /*
    if (status == '1') {
        res.sendStatus(200);
    } else {
        res.sendStatus(400);

        // Reenvía email de confirmación
        const cEmailBody = pug.compileFile('views/emailRegistro.pug');

        email.server.send({
            from: 'SnapCar <no-responder@snapcar.com.ar>',
            to: req.body.email,
            subject: 'Confirme su registro',
            attachment: [{
                data: cEmailBody({
                    nombreUsuario: req.body.nombre.split(' ')[0],
                    idRegistro: idRegistro,
                    baseUrl: req.protocol + '://' + req.headers.host
                }),
                alternative: true
            }]
        }, function (err, message) { console.log(err || message); });
    }
    */
};