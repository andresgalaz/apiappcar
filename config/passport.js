const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const Model = require('../db/model');
const config = require('../config/main');

// Setup work and export for the JWT passport strategy
module.exports = function(passport) {
	const opts = {
		jwtFromRequest: ExtractJwt.fromAuthHeader(),
		secretOrKey: config.secret
	};
	passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
		new Model.Usuario({pUsuario: jwt_payload.pUsuario}).fetch().then(function(data){
			try{
				var user = data; 
 				if( user === null){
 					done(null, false);
				} else {
					done(null, data.toJSON());
				}
			}catch(e){
				console.log(e);
 				done(e, false);
			}
		});

	}));

/*
 User.findOne({id: jwt_payload.id}, function(err, user) {
 if (err) {
 return done(err, false);
 }
 if (user) {
 done(null, user);
 } else {
 done(null, false);
 }
 });
*/
}; 
