const moment = require("moment");

module.exports = function(req, res) {
    /**
     * Es un control de acceso de nivel superior para ciertas tareas.
     * Por ahora solo se solicita al limpiar el VIRLOC de una patente,
	 * y para borrar la memoria del VIRLOC.
     */
    console.log('---------', moment().format('YYYY-MM-DD HH:mm:ss'), '--------');
    console.log('req.user:', req.user);
    console.log(req.body);
    var oOut = {
        success: true,
        password: 'CrYtNPg6'
    };
    return res.status(200).json(oOut);
};
