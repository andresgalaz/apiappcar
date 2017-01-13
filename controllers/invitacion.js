const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');

var hashId = new Hash(config.secret);

module.exports = function (req, res, id) {
    var idDecoded = String(hashId.decode(id)).slice(9),
        mensaje,
        icono;

    new Model.Invitacion({
        pInvitacion: idDecoded
    }).save({
        bRecibido: '1'
    }, {
            patch: true
        }).then(function (data) {
            if (data === null) {
                icono = 'error_outline';
                mensaje = 'La invitación no es válida. Vuelva a solicitar una.';
            } else {
                icono = 'done';
                mensaje = 'Usted ha confirmado la invitación.';
            }
            res.render(
		        'confirmaInvitacion',
		        { idInvitacion: id, mInvitacion: mensaje, mIcono: icono }
	        );
        });
};