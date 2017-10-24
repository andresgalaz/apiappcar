#!/bin/sh
if [ "$1" ] ; then
	WSAPI_AMBIENTE="$1"
	export WSAPI_AMBIENTE
fi
if [ ! "$WSAPI_AMBIENTE" ] ; then
	echo "No existe variable de ambiente WSAPI_AMBIENTE"
	exit 1
fi
if [ "$WSAPI_AMBIENTE" = "DESA" ] ; then
	BASE_DATOS=score_desa
elif [ "$WSAPI_AMBIENTE" = "TEST" ] ; then
	BASE_DATOS=score
	DIR_PROCESO=/home/ubuntu/migraObservations
	PASSWORD=snapcar
elif [ "$WSAPI_AMBIENTE" = "PROD" ] ; then
	BASE_DATOS=score
	DIR_PROCESO=/home/ubuntu/app_score/migraObservations
	PASSWORD=oycobe
else
	echo "Ambiente WSAPI_AMBIENTE=$WSAPI_AMBIENTE, desconocido"
	exit 1
fi
 # Se posiciona en la ruta donde está la SHELL
RUTA=`dirname "$0"`
if [ $RUTA != "." ] ; then
    cd $RUTA
fi

# Mata los procesos que sigan corriendo: node notifica
ps -fe | grep node | grep notifica | awk '{print $2}' | while read pid
do 
	echo Finalizando proceso $pid
	kill -1 $pid
done

echo '-----------------------------'
echo "| WSAPI_AMBIENTE = $WSAPI_AMBIENTE"
echo '-----------------------------'
echo
echo '-----------------------------'
echo '|  Notifica '
echo '-----------------------------'
node notifica
