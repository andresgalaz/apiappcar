const config = require('./config/main');

dbLocal = require('knex')({
	client: 'mysql',
	connection: {
		host: '127.0.0.1',
		user: 'snapcar',
		password: 'snapcar',
		database: 'score',
		charset: 'UTF8_GENERAL_CI'
	}
});

dbLocal
.select( 'pUsuario', 'cPassword' )
.from('tUsuario')
.then(function(data){
    console.log('UPDATED', data);
});
