const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');
const email = require('../config/emailServer');

var hashId = new Hash(config.secret);

module.exports = function (req, res) {
    var id = req.body.id,
        email = req.body.email,
        nombre = req.body.nombre,
        idDecoded = String(hashId.decode(id)).slice(9),
        mensaje = '';

    if (req.body.id && req.body.acepta === '1') {
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
                                } else {
                                    mensaje = 'exito';
                                }
                            });
                    }
                } catch (err) {
                    console.log(err);
                    mensaje = 'error';
                }
            });

        return res.status(200).json(mensaje);
    } else {
        var emailDecoded = String(hashId.decode(email)).slice(9),
            nombreDecoded = String(hashId.decode(nombre)).slice(9),
            newUsuario = new Model.Usuario({ pUsuario: idDecoded });

        const cEmailBody = pug.compileFile('views/emailRegistro.pug');

        email.server.send({
            from: 'SnapCar <no-responder@snapcar.com.ar>',
            to: emailDecoded,
            subject: 'Confirme su registro',
            attachment: [{
                data: cEmailBody({
                    nombreUsuario: nombreDecoded,
                    idRegistro: req.body.id,
                    baseUrl: req.protocol + '://' + req.headers.host
                }),
                alternative: true
            }]
        }, function (err, message) { console.log(err || message); });

        return res.status(401).json({ success: false, message: 'No se encontró id o estado.' });
    }
    /*    
    if (req.body) {
        return(req.body);
        
        var newUsuario = new Model.Usuario({ pUsuario: idDecoded });

        newUsuario
            .fetch()
            .then(function (data) {
                try {
                    if (data.attributes.bConfirmado === '1') {
                        template('confirmado');
                    } else {
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
*/
    // Reenvía email de confirmación
    /*
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