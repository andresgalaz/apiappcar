const express = require('express');
const Model = require('../db/model');
const config = require('../config/main');

module.exports = function(newReq, id) {
    console.log('ID: ' + id);
    console.log('Usuario: ' + newReq);

/*
    new Model.Cuenta({
        fUsuarioTitular: req.user.pUsuario
    }).fetch().then(function (data) {
        console.log('Data:' + data);
    });
*/
};