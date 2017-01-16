//const express = require('express');
const Hash = require('hashids');
const Model = require('../db/model');
const config = require('../config/main');

var hashId = new Hash(config.secret);

module.exports = function (req, res, id) {
    var idDecoded = String(hashId.decode(id)).slice(9),
        estado;

    new Model.Invitacion({
        pInvitacion: idDecoded
    }).fetch().then(function (data) {
        if (data.attributes.bRecibido === '1') {
            estado = 'aceptado';
        } else {
            this.save({
                bRecibido: '1'
            }, {
                    patch: true
                }).then(function (data) {
                    if (data === null) {
                        estado = 'error';
                    } else {
                        estado = 'exito';
                    }
                });
        }
    }).then(function () {
        res.render(
            'confirmaInvitacion',
            { idInvitacion: id, estadoInvitacion: estado }
        );
    });
};