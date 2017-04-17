$(document).ready(function () {
    var politicasPrivacidad = true,
        terminosCondiciones = false,
        urlParams = new URLSearchParams(window.location.search),
        idRegistro = urlParams.get('id');

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

    if (idRegistro) {
        $('#modalLegales').modal({
            backdrop: 'static',
            keyboard: false
        }); 
    } else {
        $('#estado').text('Tu ID de registro es incorrecto, volvé a intentarlo nuevamente.');
    }

    $('.modal-footer button').last().click(function () {
        $.ajax({
            type: 'GET',
            data: $.param({ estado: '1', id: idRegistro }),
            url: '/registro/confirma/',
            success: function () {
                $('#estado').text('Gracias por confirmar tu email. Ahora podés ingresar a tu cuenta.');
            }
        });
    });

    $('.modal-footer button').first().click(function () {
        $.ajax({
            type: 'GET',
            data: $.param({ estado: '0', id: idRegistro }),
            url: '/registro/confirma/',
            success: function () {
                $('#estado').text('Para poder utilizar SnapCar debes aceptar nuestros términos y condiciones y nuestra política de privacidad.');
            }
        });
    });
});