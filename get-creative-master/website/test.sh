#!/bin/bash
cd "$( cd "$( dirname "$0" )" && pwd )"
NODE_ENV=test node app/launcher.js &
SERVER_PID=$!
NODE_ENV=test mocha --require should --compilers coffee:coffee-script --reporter spec --timeout 5000
kill $SERVER_PID
