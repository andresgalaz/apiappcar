const express = require('express');
const Model = require('../db/model');

module.exports = function(req, id) {
    console.log('ID: ' + id);

    new Model.Cuenta({
        fUsuarioTitular: req.user.pUsuario
    }).fetch().then(function (data) {
        console.log('Data:' + data);
    });
};