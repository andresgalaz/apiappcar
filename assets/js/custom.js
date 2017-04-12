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
            data: $.param({ estado: "1" }),
            url: '/registro/confirma/',
            success: function () {
                $('#estado').text('Gracias por confirmar tu email. Ahora podés ingresar a tu cuenta.');
            }
        });
    });

    $('.modal-footer button').first().click(function () {
        $.ajax({
            type: 'POST',
            data: $.param({ estado: "0" }),
            url: '/registro/confirma/',
            success: function () {
                $('#estado').text('Para poder utilizar SnapCar debes aceptar nuestros términos y condiciones y nuestra política de privacidad.');
            }
        });
    });

});