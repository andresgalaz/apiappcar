var email   = require("emailjs/email");
var server  = email.server.connect({
   host:    "127.0.0.1", 
   ssl:     false
});

module.exports = {
  server : server
};
