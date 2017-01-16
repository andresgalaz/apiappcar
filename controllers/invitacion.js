const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');

var hashId = new Hash(config.secret);

module.exports = function (req, res, id) {
    console.log("REQ", req);
    console.log("RES", res);
    console.log("ID", id);

    var idDecoded = String(hashId.decode(id)).slice(9),
        estado;

    new Model.Invitacion({
        pInvitacion: idDecoded
    }).fetch().then(function (data) {
        if (data.attributes.bRecibido === '1') {
            estado = 'aceptado';
        } else {
            this.save({
                bRecibido: '1'
            }, {
                    patch: true
                }).then(function (data) {
                    if (data === null) {
                        estado = 'error';
                    } else {
                        estado = 'exito';
                    }
                    res.render(
                        'confirmaInvitacion',
                        { idInvitacion: id, estadoInvitacion: estado }
                    );
                });
        }
    });
};