var Util = {};

Util.esDni = function( nDni ){
	return true;
}

Util.esSexo = function( cSexo ){
	return( cSexo == 'M' || cSexo == 'F' );
}

Util.esFecha = function( cFec ){
	return true;
}

Util.fmtFecha = function( d ){
	try {
		return d.toISOString().slice(0,10);
	} catch( e ) {
		return d;
	}
}



// Return FALSE INVALIDA
// Return TRUE VALIDA
Util.validaPatente = function(id) {
	var pPatente = id;

	var varLetras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	var varNumeros = '0123456789';

	var varText = pPatente.replace(/-/g, "").toUpperCase().trim();
	var varError = false;

	// sacar la validación cuando se corrija el área del as400
	if (varText.length == 10) {
		return false;
	}

	if (varText.length == 3) {
		if (varText != 'A/D') {
			return false;
		} else {
			return true;
		}
	} else if (varText.length == 6) {
		// Prueba con el formato LLLNNN (auto común)
		for (var k = 0; k < 3; k++) {
			if (varLetras.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		for (k = 3; k < 6; k++) {
			if (varNumeros.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		if (!varError) {
			return true;
		}

		// Prueba con el formato LLNNNN (auto diplomático)
		varError = false;
		for (k = 0; k < 2; k++) {
			if (varLetras.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		for (k = 2; k < 6; k++) {
			if (varNumeros.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		if (!varError) {
			return true;
		}

		// Prueba con el formato NNNLLL (moto)
		varError = false;
		for (k = 0; k < 3; k++) {
			if (varNumeros.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		for (k = 3; k < 6; k++) {
			if (varLetras.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		if (!varError) {
			return true;
		}
	} else if (varText.length == 7) {
		// Prueba con el formato LLNNNLL (nuevo auto común)
		for (k = 0; k < 2; k++) {
			if (varLetras.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		for (k = 2; k < 5; k++) {
			if (varNumeros.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		for (k = 5; k < 7; k++) {
			if (varLetras.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		if (!varError) {
			return true;
		}

		// Prueba con el formato LNNNLLL (nueva moto)
		varError = false;
		for (k = 0; k < 1; k++) {
			if (varLetras.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		for (k = 1; k < 4; k++) {
			if (varNumeros.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		for (k = 4; k < 7; k++) {
			if (varLetras.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		if (!varError) {
			return true;
		}
	} else if (varText.length == 9) {
		// Prueba con el formato NNNLLLNNN (acoplado)
		varError = false;

		for (k = 0; k < 3; k++) {
			if (varNumeros.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		for (k = 3; k < 6; k++) {
			if (varLetras.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		for (k = 6; k < 9; k++) {
			if (varNumeros.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		if (!varError) {
			return true;
		}
	} else if (varText.length == 10) {
		// Prueba con el formato NNNLLNNNLL (nuevo acoplado)
		varError = false;

		for (k = 0; k < 3; k++) {
			if (varNumeros.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		for (k = 3; k < 5; k++) {
			if (varLetras.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		for (k = 5; k < 8; k++) {
			if (varNumeros.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		for (k = 8; k < 10; k++) {
			if (varLetras.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		if (!varError) {
			return true;
		}
	} else if (varText.length >= 7) {
		// Prueba con el formato de patente vieja (1 letra, 6 numeros o mas) LNNNNNN
		varError = false;
		if (varLetras.indexOf(varText.charAt(0)) == -1) {
			varError = true;
		}
		for (k = 1; k < (varText.length - 1); k++) {
			if (varNumeros.indexOf(varText.charAt(k)) == -1) {
				varError = true;
			}
		}
		if (!varError) {
			return true;
		}
	}

	// Si llego hasta aca es porque no matcheo con ningun formato de
	// patente permitido, por lo tanto devuelve false
	return false;
}

Util.generaIdInvitacion = function(){
	return 'xyyxxxxx-xxxx'.replace(/[xy]/g, function(c) {
    	var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    	return v.toString(16);
	});
}

module.exports = Util;
