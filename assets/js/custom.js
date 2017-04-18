$(document).ready(function () {
    var politicasPrivacidad = true,
        terminosCondiciones = false,
        urlParams = new URLSearchParams(window.location.search),
        idRegistro = urlParams.get('id'),
        emailRegistro = urlParams.get('email'),
        nombreRegistro = urlParams.get('nombre');

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

    if (idRegistro && emailRegistro) {
        $('#modalLegales').modal({
            backdrop: 'static',
            keyboard: false
        }); 
    } else {
        $('#estado').text('Tu ID de registro es incorrecto, volvé a intentarlo nuevamente.');
    }

    $('.modal-footer button').last().click(function () {
        $.ajax({
            type: 'POST',
            data: $.param({ acepta: '1', id: idRegistro }),
            url: '/registro/confirma/',
            success: function (data) {
                console.log('DATA', data);
                // $('#estado').text('Gracias por confirmar tu email. Ahora podés ingresar a tu cuenta.');
            }
        });
    });

    $('.modal-footer button').first().click(function () {
        $.ajax({
            type: 'POST',
            data: $.param({ acepta: '0', id: idRegistro, email: emailRegistro, nombre: nombreRegistro }),
            url: '/registro/confirma/',
            success: function (data) {
                console.log('DATA', data);
                // $('#estado').text('Para poder utilizar SnapCar debes aceptar nuestros términos y condiciones y nuestra política de privacidad.');
            }
        });
    });
});