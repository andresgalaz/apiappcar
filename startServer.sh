#!/bin/bash
AMBIENTE=PROD
if [ ! "$WSAPI_AMBIENTE" ] ; then
	echo No está definida la variable de ambiente '$WSAPI_AMBIENTE'
	exit 1
fi
nohup nodemon -I server.js "$WSAPI_AMBIENTE" > server_"$WSAPI_AMBIENTE".log 2>&1 &
