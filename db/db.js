const config = require('../config/main');
var knex = require('knex')({
    client: 'mysql',
    debug: false,
    connection: config.jsonConexion
});

var DB = require('bookshelf')(knex);

module.exports = {
    scoreDB: DB,
    convertEventos: function(ob) {
        return [
            { idEvento: '3', tipoEvento: 'Aceleración', cantidad: (ob.nQAceleracion ? ob.nQAceleracion : 0) },
            { idEvento: '4', tipoEvento: 'Frenada', cantidad: (ob.nQFrenada ? ob.nQFrenada : 0) },
            { idEvento: '5', tipoEvento: "Exceso Velocidad", cantidad: (ob.nQVelocidad ? ob.nQVelocidad : 0) },
            { idEvento: '6', tipoEvento: "Curvas", cantidad: (ob.nQCurva ? ob.nQCurva : 0) }
        ];
    }
};