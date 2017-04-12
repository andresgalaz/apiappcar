const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');

module.exports = function (req, res) {
    var confirmaRegistro = function (req, res) {
        console.log(req.body);

        res.render(
			'confirmaRegistro',
			{ idRegistro: '1234', estadoRegistro: 'Test' }
		);
    };

    confirmaRegistro(req, res);
};