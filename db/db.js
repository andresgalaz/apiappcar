const config = require('../config/main');
var knex = require('knex')({
    client: 'mysql',
    debug: false,
    connection: config.jsonConexion
});

var DB = require('bookshelf')(knex);

module.exports = {
    scoreDB : DB,
    convertEventos : function (ob) {
        return [
            { idEvento: '3', tipoEvento: 'Aceleración', cantidad: ob.nQAceleracion },
            { idEvento: '4', tipoEvento: 'Frenada', cantidad: ob.nQFrenada },
            { idEvento: '5', tipoEvento: "Exceso Velocidad", cantidad: ob.nQVelocidad },
            { idEvento: '6', tipoEvento: "Curvas", cantidad: ob.nQCurva }
        ];
    }
};
