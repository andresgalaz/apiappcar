const express = require('express');
const config = require('../config/main');

module.exports = function(req, id) {
    console.log('ID: ' + id);

    new Model.Cuenta({
        fUsuarioTitular: req.user.pUsuario
    }).fetch().then(function (data) {
        console.log('DATA:' + data);
    })
};