const crypto = require('crypto');

var cSecret=x 'GonzaloDelger2016$-01';
var AMBIENTE=process.env.WSAPI_AMBIENTE;
var oConexion=null;

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

module.exports = {
    'secret': cSecret,
    jsonConexion: oConexion,
    encripta: function(clave) {
        if( clave == null )
            return null;
        return crypto.createHmac('sha256', cSecret).update(clave).digest('base64');
    }
};

