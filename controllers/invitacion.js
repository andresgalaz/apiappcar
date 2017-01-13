module.exports = function(id) {
    console.log('ID: ' + id);

    res.render(
		'confirmaInvitacion',
        { idInvitacion: id }
	);
};