app.set('view engine', 'pug');

var id = req.param('id');

res.render(
    'confirmaInvitacion',
    { idInvitacion: id }
);