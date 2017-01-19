const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');

var hashId = new Hash(config.secret),
    estado = null;

module.exports = function (req, res, id) {
    var idDecoded = String(hashId.decode(id)).slice(9),
        newUsuario = new Model.Usuario({ pUsuario: idDecoded }),
        template = function (estado) {
            res.render(
                'confirmaRegistro',
                { idRegistro: id, estadoRegistro: estado }
            );
        };

    newUsuario
        .fetch()
        .then(function (data) {
            if (data.attributes.bConfirmado === '1') {
                //estado = 'confirmado';
                template(confirmado);
            } else {
                this.save({ bConfirmado: '1' }, { patch: true })
                    .then(function (data) {
                        if (data === null) {
                            console.log('ERROR');
                            estado = 'error';
                        } else {
                            console.log('EXITO');
                            estado = 'exito';
                        }
                        //
                        template(estado);
                    });
            }
        });
};

/*
res.render(
    'confirmaRegistro',
    { idRegistro: id, estadoRegistro: estado }
);
*/