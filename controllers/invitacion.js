const express = require('express');
const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');

var hashId = new Hash(config.secret);

module.exports = function(req, id) {
    console.log('ID: ' + id);
    console.log('ID Decoded:' + hashId.decode(id).slice(9));

/*
    new Model.Invitacion({
        fCuenta: cta.pCuenta
    }).fetch().then(function (data) {
        console.log('Data:' + data);
    });
*/
};