const config = require('../config/main');

dbLocal = require('knex')({
	"client": 'mysql',
	"connection": config.jsonConexion
});

dbLocal
.select( 'pUsuario', 'cPassword' )
.from('tUsuario')
.then(function(data){
	for( var i=0 ; i < data.length ; i++ )
    	console.log('update tUsuario set cPassword=', "'"+config.encripta(data[i].cPassword)+"'", ' where pUsuario=',data[i].pUsuario,';');
	process.exit(0);
});
