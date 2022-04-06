#!/bin/bash
# Quickly fire up Cypress using the CI settings for interactive local usage.
echo "Opening Cypress mocked tests..."

if pgrep "nginx" >/dev/null 
then
    echo "nginx is running - ok"
else
    echo "nginx is stopped, please start nginx"
    exit 0
fi

set -ae

trap 'kill $(jobs -p)' INT TERM EXIT

echo "loading environment variables"
source cypress-mocked.env
CI_ENV=$(cat cypress-mocked.env | tr '\n' ',')
CI_ENV=${CI_ENV%?}

echo "building gateway"
yarn build
echo "starting mock server"
yarn mock-server &
yarn wait-on:mock-server
echo "starting gateway server, and waiting for https://profile.thegulocal.com/healtcheck"
yarn start &
yarn wait-on:server
echo "opening cypress"
yarn cypress open --env $CI_ENV --config '{"testFiles":["mocked/**/*.ts"]}'
