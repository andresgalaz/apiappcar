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
            $('.modal-footer button').removeAttr('disabled');
        }
    }

    $('.modal-footer button').last().click(function () {
        $.ajax({
            type: 'POST',
            data: '{ "Estado": "1" }',
            url: '/registro/confirma/',
            statusCode: {
                200: function () {
                    console.log('Actualizar estado');
                }
            }
        });
    });

    $('.modal-footer button').first().click(function () {
        $.ajax({
            type: 'POST',
            data: '{ "Estado:": "0" }',
            url: '/registro/confirma/',
            statusCode: {
                404: function () {
                    console.log('No actualizar estado');
                }
            }
        });
    });

});