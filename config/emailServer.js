var email   = require("emailjs/email");
var server  = email.server.connect({
   host:    "smtp.mandrillapp.com", 
   port:	25,
   ssl:     false,
   user:	"SnapCar",
   password:"ABGCPPsUFHNZcVOom9LKxg"
});

module.exports = {
  server : server
};
