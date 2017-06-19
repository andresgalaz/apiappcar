const crypto = require('crypto');

var cSecret = 'GonzaloDelger2016$-01';
var oConexion = null,
    cDirAdjunto = null;
if (process.env.WSAPI_AMBIENTE == 'DESA') {
    cDirAdjunto = '/home/agalaz/adjunto';
    oConexion = {
        host: '127.0.0.1', // your host
        user: 'snapcar', // your database user
        password: 's', // your database password
        database: 'score',
        port: 3306,
        charset: 'UTF8_GENERAL_CI'
    };
} else if (process.env.WSAPI_AMBIENTE == 'TEST') {
    cDirAdjunto = '/home/ubuntu/adjunto/';
    oConexion = {
        host: '127.0.0.1', // your host
        user: 'snapcar', // your database user
        password: 'snapcar', // your database password
        database: 'score',
        charset: 'UTF8_GENERAL_CI'
    };
} else if (process.env.WSAPI_AMBIENTE == 'PROD') {
    cDirAdjunto = '/home/ubuntu/adjunto/';
    oConexion = {
        host: '127.0.0.1', // your host
        user: 'snapcar', // your database user
        password: 'oycobe', // your database password
        database: 'score',
        charset: 'UTF8_GENERAL_CI'
    };
}

console.log(process.env.WSAPI_AMBIENTE, oConexion);
module.exports = {
    ambiente: process.env.WSAPI_AMBIENTE,
    dirAdjunto: cDirAdjunto,
    encripta: function(clave) {
        if (clave == null)
            return null;
        return crypto.createHmac('sha256', cSecret).update(clave).digest('base64');
    },
    jsonConexion: oConexion,
    secret: cSecret
};
