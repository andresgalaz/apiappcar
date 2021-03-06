const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');

var hashId = new Hash(config.secret);

module.exports = function (req, res, id) {
    var idDecoded = String(hashId.decode(id)).slice(9),
        newInvitacion = new Model.Invitacion({ pInvitacion: idDecoded }),
        template = function (estado) {
			res.render(
				'confirmaInvitacion',
				{ idInvitacion: id, estadoInvitacion: estado }
			);
		};

    newInvitacion
        .fetch()
        .then(function (data) {
            try {
                if (data.attributes.bRecibido === '1') {
                    template('aceptado');
                } else {
                    this.save({ bRecibido: '1' }, { patch: true })
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
};