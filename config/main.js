const crypto = require('crypto');

var cSecret = 'GonzaloDelger2016$-01';

module.exports = {
    'secret': cSecret,
    encripta: function(clave) {
        if( clave == null )
            return null;
        return crypto.createHmac('sha256', cSecret).update(clave).digest('base64');
    }
};

