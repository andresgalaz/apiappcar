const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');

var hashId = new Hash(config.secret),
    estado = null;

module.exports = function (req, res, id) {
    var idDecoded = String(hashId.decode(id)).slice(9);

    console.log(id);
    console.log(idDecoded);

    new Model.Usuario({ pUsuario: idDecoded })
        .fetch()
        .then(function (data) {
            try {
                if (data.attributes.bConfirmado === '1') {
                    estado = 'confirmado';
                } else {
                    this.save({ bConfirmado: '1' }, { patch: true })
                        .then(function (data) {
                            if (data === null) {
                                estado = 'error';
                            } else {
                                estado = 'exito';
                            }
                        });
                }
            } catch (err) {
                console.log(err);
                estado = false;
            }
        })
        .then(function () {
            res.render(
                'confirmaRegistro',
                { idRegistro: id, estadoRegistro: estado }
            );
        });

    /*
    new Model.Invitacion({ pInvitacion: idDecoded })
        .fetch()
        .then(function (data) {
            try {
                if (data.attributes.bRecibido === '1') {
                    estado = 'aceptado';
                } else {
                    this.save({ bRecibido: '1' }, { patch: true })
                        .then(function (data) {
                            if (data === null) {
                                estado = 'error';
                            } else {
                                estado = 'exito';
                            }
                        });
                }
            } catch (err) {
                estado = 'error';
                console.log(err);
            }
        }).then(function () {
            res.render(
                'confirmaInvitacion',
                { idInvitacion: id, estadoInvitacion: estado }
            );
        });
    */
};