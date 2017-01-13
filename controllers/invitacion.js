module.exports = function(id) {
    app.set('view engine', 'pug');
    console.log('ID: ' + id);
    res.render(
		'confirmaInvitacion',
		{ idInvitacion: id }
	);
};