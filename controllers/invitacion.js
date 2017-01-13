const express = require('express');
const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');

var hashId = new Hash(config.secret);

module.exports = function (req, id) {
    id = String(hashId.decode(id)).slice(9);

    new Model.Invitacion({
        pInvitacion: id
    }).save({
        bRecibido: '1'
    }, {
            patch: true
        }).then(function (data) {
            console.log(data);
        });
};