const config = require('../config/main');

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
	for( i=0 ; i < data.length ; i++ )
    	console.log('update tUsuario set cPassword=', "'"+config.encripta(data[i].cPassword)+"'", ' where pUsuario=',data[i].pUsuario,';');
	process.exit(0);
});
