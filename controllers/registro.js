const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');

var hashId = new Hash(config.secret);

module.exports = function (req, res, id) {
    var idDecoded = String(hashId.decode(id)).slice(9);

    new Model.Usuario({ cEmail: idDecoded })
        .fetch()
        .then(function (data) {
            try {
                this.save({ bConfirmado: '1' }, { patch: true })
            } catch (e) {
                console.log(e);
            }
        })
        .then(function () {
            res.render(
                'confirmaRegistro',
                { idInvitacion: id, estadoInvitacion: estado }
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