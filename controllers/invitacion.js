const express = require('express');
const config = require('../config/main');

app.set('view engine', 'pug');

res.render(
    'confirmaInvitacion',
    { idInvitacion: id }
);