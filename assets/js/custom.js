loading = $('#loading-wrap').hide();

$(document)
    .ajaxStart(function () {
        loading.show();
    })
    .ajaxStop(function () {
        loading.hide();
    });

$(document).ready(function () {

    // Variables de inicialización
    var politicasPrivacidad = true,
        terminosCondiciones = false,
        urlParams = new URLSearchParams(window.location.search),
        idRegistro = urlParams.get('id'),
        emailRegistro = urlParams.get('email'),
        nombreRegistro = urlParams.get('nombre'),
        mensajeExito = 'Gracias por confirmar tu email. Ahora podés ingresar a tu cuenta.',
        mensajeError = 'No fue posible confirmar tu registro. Intentalo nuevamente.',
        mensajeDeclina = 'Para poder utilizar SnapCar debes aceptar nuestros términos y condiciones y nuestra política de privacidad.';

    function chequeaEstado() {
        if (terminosCondiciones && politicasPrivacidad) {
            $('.modal-footer button').removeAttr('disabled');
        }
    }

    $('#accordion').find('a').first().on('click', function () {
        politicasPrivacidad = true;
        chequeaEstado();
    });

    $('#accordion').find('a').last().on('click', function () {
        terminosCondiciones = true;
        chequeaEstado();
    });

    if (idRegistro && emailRegistro) {
        loading.show();
        $('#modalLegales').modal({
            backdrop: 'static',
            keyboard: false
        });
    } else {
        $('#estado').text('Tu ID de registro es incorrecto, volvé a intentarlo nuevamente.');
        loading.hide();
    }

    $('.modal-footer button').last().click(function () {
        $.ajax({
            type: 'POST',
            data: $.param({ acepta: '1', id: idRegistro }),
            url: '/registro/confirma/',
            success: function (data) {
                if (data === 'exito') {
                    $('#estado').text(mensajeExito);
                } else {
                    $('#estado').text(mensajeError);
                }
            }
        });
    });

    $('.modal-footer button').first().click(function () {
        $.ajax({
            type: 'POST',
            data: $.param({ acepta: '0', id: idRegistro, email: emailRegistro, nombre: nombreRegistro }),
            url: '/registro/confirma/'
        });
        $('#estado').text(mensajeDeclina);
    });
});