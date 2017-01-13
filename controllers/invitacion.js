const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');

var hashId = new Hash(config.secret);

module.exports = function (req, res, id) {
    var idDecoded = String(hashId.decode(id)).slice(9),
        resInvitacion;

    new Model.Invitacion({
        pInvitacion: idDecoded
    }).save({
        bRecibido: '1'
    }, {
            patch: true
        }).then(function (data) {
            if (data === null) {
                resInvitacion = false;
            } else {
                resInvitacion = true;
            }
            res.render(
		        'confirmaInvitacion',
		        { idInvitacion: id, resInvitacion: mensaje }
	        );
        });
};