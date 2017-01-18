const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');

var hashId = new Hash(config.secret);

module.exports = function (req, res, id) {
    var idDecoded = String(hashId.decode(id)).slice(9);

/*
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
                            res.render(
                                'confirmaRegistro',
                                { idRegistro: id, estadoRegistro: estado }
                            );
                        });
                }
            } catch (err) {
                console.log(err);
            }
        });
*/

    var newUsuario = new Model.Usuario({ pUsuario: idDecoded });
    var estado = null;

    newUsuario.fetch()
        .then(function (data) {
            if (data.attributes.bConfirmado === '1') {
                estado = 'confirmado';
            } else {
                this.save({ bConfirmado: '1' }, { patch: true })
                    .then(function (data) {
                        if (data === null) {
                            console.log('ERROR');
                            estado = 'error';
                        } else {
                            console.log('EXITO');
                            var estado = 'exito';
                        }
                    });
            }
        })
        .then(function () {
            console.log('ESTADO:', newUsuario.estado);
        });
};