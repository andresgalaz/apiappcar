// Include our packages in our main server file
const express = require('express');
app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const passport = require('passport');
const cors = require('cors');
const port = 8080;
 
// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// Log requests to console
app.use(morgan('dev'));

// Home route. We'll end up changing this to our main front end index later.
app.get('/', function(req, res) {
  res.send('Página en construcción.');
});
app.get('/bitacora', function(req, res) {
  res.sendfile('server.log');
});

require('./app/routes')(app);

// Start the server
app.listen(port);
console.log('Your server is running on port ' + port + '.');
