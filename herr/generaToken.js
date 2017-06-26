const Model = require('../db/model');
const config = require('../config/main');
const jwt = require('jsonwebtoken');

module.exports = {
    /**
     * Genera token con la información recibida en @param
     * @param {*} user 
     * @param {int} duracion Duración en segundos, por defecto son 35 días
     */
    genera: function(user, duracion) {
        var token = 'error token';
        if (!duracion)
            duracion = 3024000 // 35 días en segundos

        var oPayLoad = {
            pUsuario: user.pUsuario,
            bConfirmado: user.bConfirmado,
            cPerfil: (user.cPerfil ? user.cPerfil : '*'),
            nDuracionToken: duracion
        };
        token = jwt.sign(oPayLoad, config.secret, {
            expiresIn: duracion
        });

        var usrOut = Model.UsuarioVeh.salida(user);

        usrOut.success = true;
        usrOut.token = 'JWT ' + token;

        return usrOut;
    }
};