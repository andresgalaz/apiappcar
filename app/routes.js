// Import dependencies
const passport = require('passport');
const express = require('express');
const config = require('../config/main');
const jwt = require('jsonwebtoken');

// Set up middleware
const requireAuth = passport.authenticate('jwt', { session: false });

// Export the routes for our app to use
module.exports = function(app) {
    // API Route Section

    // Initialize passport for use
    app.use(passport.initialize());
    // Bring in defined Passport Strategy
    require('../config/passport')(passport);
    // Create API group routes
    const apiRoutes = express.Router();

    function agvJwt(req, res, next) {
        passport.authenticate('jwt', { session: false }, function(err, user, info) {
            if (err) { return next(err); }
            if (!user) { return res.status(401).json({ success: false, code: 10, message: 'Token incorrecto o vencido.' }); }
            // edit as per comment
            //return res.send("Test Route Accessed").end();
            req.user = user;
            next();
        })(req, res, next);
    }

    // Conecta los servicios
    apiRoutes.post('/wsLogin', require('../servicio/wsLogin'));
    apiRoutes.post('/wsRecuperaPassword', require('../servicio/wsRecuperaPassword'));
    apiRoutes.post('/wsRegistro', require('../servicio/wsRegistro'));
    apiRoutes.post('/wsTokenTemporal', require('../servicio/wsTokenTemporal'));
    // Service que requieren TOKEN de autenticación
    apiRoutes.post('/wsAppEstado', agvJwt, require('../servicio/wsAppEstado'));
    apiRoutes.post('/wsAuditoria', agvJwt, require('../servicio/wsAuditoria'));
    apiRoutes.post('/wsCambioPassword', agvJwt, require('../servicio/wsCambioPassword'));
    apiRoutes.post('/wsEventosViaje', agvJwt, require('../servicio/wsEventosViaje'));
    apiRoutes.post('/wsFirmware', agvJwt, require('../servicio/wsFirmware'));
    apiRoutes.post('/wsInicioTransferencia', agvJwt, require('../servicio/wsInicioTransferencia'));
    apiRoutes.post('/wsInvitacion', agvJwt, require('../servicio/wsInvitacion'));
    apiRoutes.post('/wsParametros', agvJwt, require('../servicio/wsParametros'));
    apiRoutes.post('/wsReToken', agvJwt, require('../servicio/wsReToken'));
    apiRoutes.post('/wsScore', agvJwt, require('../servicio/wsScore'));
    apiRoutes.post('/wsScoreVehiculo', agvJwt, require('../servicio/wsScoreVehiculo'));
    apiRoutes.post('/wsScoreConductor', agvJwt, require('../servicio/wsScoreConductor'));
    apiRoutes.post('/wsSiniestro', agvJwt, require('../servicio/wsSiniestro'));
    apiRoutes.post('/wsSiniestroImagen', agvJwt, require('../servicio/wsSiniestroMedia'));
    apiRoutes.post('/wsSiniestroMedia', agvJwt, require('../servicio/wsSiniestroMedia'));
    apiRoutes.post('/wsSiniestroLista', agvJwt, require('../servicio/wsSiniestroLista'));
    apiRoutes.post('/wsVehiculo', agvJwt, require('../servicio/wsVehiculo'));
    apiRoutes.post('/wsVehiculoDel', agvJwt, require('../servicio/wsVehiculoDel'));
    apiRoutes.post('/wsVehiculoDelBluetooth', agvJwt, require('../servicio/wsVehiculoDelBluetooth'));
    apiRoutes.post('/wsVehiculoDesconectado', agvJwt, require('../servicio/wsVehiculoDesconectado'));
    apiRoutes.delete('/wsVehiculo', agvJwt, require('../servicio/wsVehiculoDel'));
    // Servicios sin autenticación de TOKEN
    apiRoutes.post('/wsCalculaDescuento', require('../servicio/wsCalculaDescuento'));

    // Set url for API group routes
    app.use('/', apiRoutes);
};