var knex = require('knex')({
	client: 'mysql',
	debug: false,
	connection: {
		host: '127.0.0.1',  // your host
		user: 'snapcar', // your database user
		password: 'snapcar', // your database password
		database: 'score',
		charset: 'UTF8_GENERAL_CI'
	}
});

/*
var config = {
   host: 'localhost',  // your host
   user: 'snapcar', // your database user
   password: 'snapcar', // your database password
   database: 'score_desa',
   charset: 'UTF8_GENERAL_CI'
};
*/

var DB = require('bookshelf')(knex);
/*
var DB = Bookshelf.initialize({
   client: 'mysql', 
   connection: config,
   debug: true
});
*/

module.exports.scoreDB = DB;
