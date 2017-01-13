const express = require('express');
const pug = require('pug');
const config = require('../config/main');

var app = express();

app.set('view engine', 'pug');

module.exports = function(res, id) {
    console.log('ID: ' + id);
    res.render(
		'confirmaInvitacion',
		{ idInvitacion: id }
	);
};