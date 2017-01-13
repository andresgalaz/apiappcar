const express = require('express');
const config = require('../config/main');

module.exports = function(req, id) {
    console.log('ID: ' + id);
    console.log('Req: ' + req);
};