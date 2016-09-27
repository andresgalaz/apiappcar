#!/bin/bash
nohup nodemon -I server.js PROD > server.log 2>&1 &
