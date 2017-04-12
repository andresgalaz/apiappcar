$(document).ready(function () {
    var politicasPrivacidad = true,
        terminosCondiciones = false;

    $('#modalLegales').modal({
        backdrop: 'static',
        keyboard: false
    });

    $('#accordion').find('a').first().on('click', function () {
        politicasPrivacidad = true;
        chequeaEstado();
    });

    $('#accordion').find('a').last().on('click', function () {
        terminosCondiciones = true;
        chequeaEstado();
    });

    function chequeaEstado() {
        if (terminosCondiciones && politicasPrivacidad) {
            $('.modal-footer input[type=submit]').removeAttr('disabled');
        }
    }
});