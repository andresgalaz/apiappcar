const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');
const email = require('../config/emailServer');

module.exports = function (req, res) {
    console.log(req.body);
    console.log('Estado:', req.body.estado);

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