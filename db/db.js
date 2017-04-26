const config = require('../config/main');
var knex = require('knex')({
    client: 'mysql',
    debug: false,
    connection: config.jsonConexion
});

var DB = require('bookshelf')(knex);

module.exports.scoreDB = DB;