const express = require('express');
const Model = require('../db/model');
const config = require('../config/main');

module.exports = function(req, id) {
    console.log('ID: ' + id);
    console.log('Usuario: ' + req.user);

/*
    new Model.Cuenta({
        fUsuarioTitular: req.user.pUsuario
    }).fetch().then(function (data) {
        console.log('Data:' + data);
    });
*/
};