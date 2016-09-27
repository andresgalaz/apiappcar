const Util = require('../util');

var scoreDB = require('./db').scoreDB;

var cta = scoreDB.Model.extend({
	tableName: 'tCuenta',
	idAttribute: 'pCuenta',
});
// VEHICULO
var veh = scoreDB.Model.extend({
	tableName: 'tVehiculo',
	idAttribute: 'pVehiculo',
	vigentes: function () {
        return this.query('where', 'bVigente', '1');
    }
});
veh.validaTpDispositivo = function(nTp){
	if( nTp != 1 && nTp != 2 )
		return false;
	return true;
};
veh.salida = function(v){
	return {
		idVehiculo		: v.pVehiculo ? v.pVehiculo : v.fVehiculo,
		patente			: v.cPatente,
		marca			: v.cMarca,
		modelo			: v.cModelo,
		tipoDispositivo	: v.fTpDispositivo,
		id	 			: v.cIdDispositivo,
		idUsuarioTitular: v.fUsuarioTitular
	};
};

// USUARIO
var usr = scoreDB.Model.extend({
	tableName: 'tUsuario',
	idAttribute: 'pUsuario'
});
var vehTitular = scoreDB.Model.extend({
	tableName: 'vVehiculo',
	idAttribute: 'pVehiculo'
});
var usrVeh = scoreDB.Model.extend({
	tableName: 'tUsuario',
	idAttribute: 'pUsuario',
	vehiculos: function(){
		return this.hasMany( vehTitular, 'fUsuario' );
	}
});

usrVeh.salida = function(user){
	var sal = {
		usuarios: [{
			idUsuario		: user.pUsuario,
			email			: user.cEmail,
			nombre			: user.cNombre,
			dni	 			: user.nDni,
			fechaNacimiento	: Util.fmtFecha( user.dNacimiento ),
			sexo			: user.cSexo,
			confirmado		: ( user.bConfirmado == '1' )
		}]
	};
	sal.vehiculos = [];
	if( user.vehiculos ){
		for( var i=0 ; i < user.vehiculos.length ; i++ ){
			sal.vehiculos[ i ] = veh.salida( user.vehiculos[ i ]);
		}
	}
	return sal;
};
usr.token = function(user){
	var t =  {
		pUsuario		: user.pUsuario,
		bConfirmado		: user.bConfirmado
	};
	return t;
};

// INVITACION
var invitaVeh = scoreDB.Model.extend({
	tableName: 'tInvitacionVehiculo',
	idAttribute: 'pInvitacion'
});
var invita = scoreDB.Model.extend({
	tableName: 'tInvitacion',
	idAttribute: 'pInvitacion',
	vehiculos: function(){
		return this.belongsToMany( invitaVeh, 'tInvitacionVehiculo', 'pInvitacion', 'pVehiculo' );
	}
});

// SINIESTRO
var siniestro = scoreDB.Model.extend({
	tableName: 'tSiniestro',
	idAttribute: 'pSiniestro'
});

module.exports = {
	Cuenta: cta,
	Usuario: usr,
	UsuarioVeh: usrVeh,
	Vehiculo: veh,
	VehTitular: vehTitular,
	Invitacion: invita,
	InvitacionVeh: invitaVeh,
	Siniestro: siniestro
}
