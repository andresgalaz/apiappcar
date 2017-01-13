const express = require('express');
const config = require('../config/main');

var app = express();

app.set('view engine', 'pug');

module.exports = function(id) {
    console.log('ID: ' + id);
    res.render(
		'confirmaInvitacion',
		{ idInvitacion: id }
	);
};