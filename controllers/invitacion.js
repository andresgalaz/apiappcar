const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');

var hashId = new Hash(config.secret);

module.exports = function (req, res, id, estado) {
    var idDecoded = String(hashId.decode(id)).slice(9),
        newInvitacion = new Model.Invitacion({ pInvitacion: idDecoded }),
        template = function (estado) {
			res.render(
				'confirmaRegistro',
				{ idRegistro: id, estadoRegistro: estado }
			);
		};

    newInvitacion
        .fetch()
        .then(function (data) {
            try {
                if (data.attributes.bRecibido === '1') {
                    //estado = 'aceptado';
                    template('aceptado');
                } else {
                    this.save({ bRecibido: '1' }, { patch: true })
                        .then(function (data) {
                            if (data === null) {
                                //estado = 'error';
                                template('error');
                            } else {
                                //estado = 'exito';
                                template('exito');
                            }
                        });
                }
            } catch (err) {
                //estado = 'error';
                console.log(err);
                template('error');
            }
        });
};