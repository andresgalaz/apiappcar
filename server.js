// Include our packages in our main server file
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cors = require('cors');
const pug = require('pug');
const config = require('./config/main');

var app = express();

// Otorga acceso a los archivos estaticos dentro de la carpeta "assets"
app.use(express.static('assets'));

// Define pug como templating
app.set('view engine', 'pug');

// Define el puerto de acuerdo al ambiente
var port = null;
if (config.ambiente == 'DESA')
	port = 2080;
else if (config.ambiente == 'PROD')
	port = 8090;

var allowCrossDomain = function(req, res, next) {
    if ('OPTIONS' == req.method) {
      res.header('Access-Control-Allow-Origin', '*');
      // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
      res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
      res.send(200);
    }
    else {
      next();
    }
};

// Use body-parser to get POST requests for API use
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(cors());

// Log requests to console
app.use(morgan('dev'));

// Home route. We'll end up changing this to our main front end index later.
app.get('/', function (req, res) {
	res.send('Página en construcción.');
});

app.get('/bitacora', function (req, res) {
	res.sendfile('server_' + config.ambiente + '.log');
});

// Página de confirmación de invitación
app.get('/invitacion', function (req, res) {
	var id = req.query.id;
	require('./controllers/invitacion.js')(req, res, id);
});

// Página de confirmación de registro
app.get('/registro', function (req, res) {
	var id = req.query.id;
	require('./controllers/registro.js')(req, res, id);
});

// Nuevo
app.get('/registro/confirma', function (req, res, status) {
  var status = req.query.status;

  if (status == '1') {
    res.sendStatus(200);
  } else {
    res.sendStatus(400);
  }
});

require('./app/routes')(app);

// Start the server
app.listen(port);
console.log('Su servidor está corriendo en el puerto ' + port + '.');
