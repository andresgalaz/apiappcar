// Include our packages in our main server file
const db = require("./db/db");
const config = require('./config/main');
const emailServer = require('./config/emailServer');
const hash = require('hashids');
const moment = require("moment");
const pug = require('pug');

console.log('INICIO  ---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
process.on('exit', function () {
    console.log('TERMINO ---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
});

var cBodyRegistro = pug.compileFile('views/emailRegistro.pug');
var hashId = new hash(config.secret);

db.scoreDB.knex('tNotificacion')
    .select('pNotificacion', 'cMensaje', 'fTpNotificacion')
    .whereNull('tEnviado')
    .andWhere('fTpNotificacion', 1)
    .then(function (data) {
        if (data.length == 0)
            process.exit();
        for (i = 0; i < data.length; i++) {
            // Datos de la notificacion
            var pNotificacion = data[i].pNotificacion;
            // Para saber que es el último, así después de finalizar el mensaje termina
            var isLast = (i == (data.length - 1));
            var oInfoNotif = null;
            try {
                oInfoNotif = JSON.parse(data[i].cMensaje);
            } catch (e) {
                if (e.name == 'SyntaxError') {
                    console.error('Error en información JSON, pNotificacion:' + pNotificacion);
                } else
                    console.error(e);
                continue;
            }
            if (!oInfoNotif.id) {
                console.error('Error notificación sin Id. de Usuario (pUsuario), pNotificacion:' + pNotificacion);
                continue;
            }
            if (!oInfoNotif.email) {
                console.error('Error notificación sin Email, pNotificacion:' + pNotificacion);
                continue;
            }
            if (!oInfoNotif.nombre) {
                console.error('Error notificación sin nombre de usuario, pNotificacion:' + pNotificacion);
                continue;
            }

            // Armado del mail que espera la respuesta
            var idRegistro = hashId.encode(1e11 + oInfoNotif.id);
            var cNombre = oInfoNotif.nombre.split(' ')[0];
            var toMail = ['andres.galaz@snapcar.com.ar'];
            var linkUrl = 'https://desa.snapcar.com.ar/wappTest'
            var baseUrl = 'https://test.appcar.com.ar/'
            if (process.env.WSAPI_AMBIENTE == 'PROD') {
                linkUrl = 'https://app.snapcar.com.ar/wappCar'
                baseUrl = 'https://api.appcar.com.ar/'
                toMail = [oInfoNotif.email];
            }
            linkUrl += '/do/cli/login/registro.vm';
            emailServer
                .server
                .send({
                    from: 'SnapCar Integrity <no-responder@snapcar.com.ar>',
                    to: toMail,
                    subject: 'Confirme su registro',
                    attachment: [
                        {
                            data: cBodyRegistro({
                                nombreUsuario: cNombre,
                                idRegistro: idRegistro,
                                emailRegistro: oInfoNotif.email,
                                baseUrl: baseUrl,
                                linkUrl: linkUrl
                            }),
                            pNotificacion: pNotificacion,
                            isLast: isLast,
                            alternative: true
                        }
                    ]
                }, function (err, message) {
                    if (err) {
                        console.error(err, message);
                        if (message.attachment[0].isLast)
                            process.exit();
                        return;
                    };
                    var datNotifMsg = message.alternative;
                    console.log('enviada: [', datNotifMsg.pNotificacion, '] ', message.header.to);
                    db.scoreDB.knex('tNotificacion')
                        .where('pNotificacion', datNotifMsg.pNotificacion)
                        .update({
                            tEnviado: moment().format("YYYY-MM-DD HH:mm:ss")
                        }).then(function (dataUpd) {
                            if (datNotifMsg.isLast)
                                process.exit();
                        });
                });
        };
    }).catch(function (error) {
        // Error SQL via KNEX
        console.error(error);
        process.exit(1);
    });
