const Model		= require('../db/model');
const config	= require('../config/main');
const email		= require('../config/emailServer');
const Hash		= require('hashids');
const moment	= require("moment");
const pug 		= require("pug");

module.exports = function(req,res){
	const Util = require('../util');

	// Registra nuevos usuarios o usuarios existentes en dispositivos nuevos
	console.log('---------', moment().format("YYYY-MM-DD HH:mm:ss"), '--------');
	console.log('req.user:',req.user);
	console.log(req.body);
	if(!req.body.emailInvitado ) {
		return res.status(400).json({ success: false, code: 1810, message: 'Falta email invitado.' });
	}
	if(!req.body.vehiculos || ! Array.isArray( req.body.vehiculos ) || req.body.vehiculos.length == 0) {
		return res.status(400).json({ success: false, code: 1812, message: 'Faltan vehiculos asignados al invitado.' });
	}
	new Model.UsuarioVeh({pUsuario: req.user.pUsuario}).fetch({withRelated:['vehiculos'] }).then(function(data){
		try {
			if( data === null){
  				return res.status(401).json({ success: false, code:1820, message: 'Usuario no existe'});
			}
			var vehs = data.toJSON().vehiculos;
			// Se analiza que todos los vehiculos de la invitación pertenescan al usuario
			for( var i = 0 ; i < req.body.vehiculos.length ; i++ ){
				var vehInv = req.body.vehiculos[ i ];
				var j;
				for( j = 0 ; j < vehs.length ; j++ ){
					if( vehs[j].fVehiculo == vehInv ) break;
				}
				// Vehiculo no existe en la relación con el usuario
				if( j >= vehs.length ){
					return res.status(400).json({ success: false, code:1822, message: 'El vehículo ' + vehInv + ' no pertenece a este usuario como titular.' });
				}
			}

			// Una vez validado se crea la invitación
			new Model.Cuenta({fUsuarioTitular: req.user.pUsuario}).fetch().then(function(data){
				try {
					if (data === null ) {
						return res.status(400).json({ success: false, code: 1830, message: 'Usuario no es titular de ninguna cuenta.' });
					}
					var cta = data.toJSON();
					// No existe y se crea el usuario
					var newInvita = new Model.Invitacion({
						fCuenta			: cta.pCuenta,
						cEmailInvitado	: req.body.emailInvitado
					});
			
					var hashId = new Hash( config.secret );
					// Attempt to save the user
					var invita = null;
					newInvita.save().then(function(dataIns) {
						invita = dataIns.toJSON();
						var arrVeh = [];
						req.body.vehiculos.forEach(function(entry){
							arrVeh[arrVeh.length] = { pInvitacion: invita.pInvitacion, pVehiculo: entry };
						});
						// Convierte el PK de invitación en un HASH de largo razonable
						invita.idInvitacion = hashId.encode( 10e10 + invita.pInvitacion );
						dataIns.vehiculos().attach( arrVeh );
		
						// Template
						var cEmailBody = pug.compileFile('view/emailInvitacion.pug');

						/*
						var cEmailBody = [];
						cEmailBody.push( '<html>' );
						cEmailBody.push( '<h1>Invitación SnapCar</h1>' );
						cEmailBody.push( '<p>Usted ha sido invitado como conductor adicional por '+ req.user.cNombre +'</p>' );
						cEmailBody.push( '<p><b>Email Usuario</b> ' + req.user.cEmail + '</p>' );
						cEmailBody.push( '<p><b>Email Invitado</b> ' + req.body.emailInvitado + '</p>' );
						cEmailBody.push( '<a href="https://api.appcar.com.ar/confirma?id='+invita.idInvitacion+'">' );
						cEmailBody.push( 'Acepta' );
						cEmailBody.push( '</a>' );
						cEmailBody.push( '</html>' );
						*/
						// Envía correo al usuario invitado
						email.server.send({
								from:    "soporte <soporte@appcar.com.ar>", 
								// to:      "Andres Galaz <andres.galaz@gmail.com>", //, another <another@your-email.com>",
								// cc:      "else <else@your-email.com>",
								to:      req.body.emailInvitado, //, another <another@your-email.com>",
								subject: "Invitación Snapcar",
								attachment: [{
									//data : cEmailBody.join(''),
									data: cEmailBody({
										nombreUsuario: req.user.cNombre,
										emailUsuario: req.user.cEmail,
										emailInvitado: req.body.emailInvitado,
										idInvitacion: invita.idInvitacion
									}),
									alternative: true
								}]
						}, function(err, message) { console.log(err || message); });
						return res.status(200).json( { success: true, idInvitacion: invita.idInvitacion });
					});
				} catch( e ) {
					console.log(e.stack);
					res.status(500).json({ success: false, code:1840, message: 'Error inesperado', errors: [ {code: 1842, message: e.message }]});
				}
			});
		} catch( e ) {
			console.log( e.stack );
        	return res.status(401).json({ success: false, code:1850, message: 'Error inesperado.' });
		}
	});
};
