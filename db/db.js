var AMBIENTE=process.env.WSAPI_AMBIENTE;
if( AMBIENTE == 'DESA' )
	oConexion: {
		host: '127.0.0.1',  // your host
		user: 'snapcar', // your database user
		password: 'snapcar', // your database password
		database: 'score_desa',
		charset: 'UTF8_GENERAL_CI'
	};
else if( AMBIENTE == 'PROD' )
	oConexion: {
		host: '127.0.0.1',  // your host
		user: 'snapcar', // your database user
		password: 'snapcar', // your database password
		database: 'score',
		charset: 'UTF8_GENERAL_CI'
	};
var knex = require('knex')({
	client: 'mysql',
	debug: false,
	connection: oConexion
});

var DB = require('bookshelf')(knex);

module.exports.scoreDB = DB;
