#!/bin/bash
# Quickly fire up Cypress using the CI settings for interactive local usage.

# Set DEV_MODE=true to run the mocked tests with the development server.
# We default to false here.
: "${DEV_MODE:=false}"

if [[ "$DEV_MODE" == "true" ]]; then
  echo "Opening Cypress mocked tests with development server..."
else
  echo "Opening Cypress mocked tests..."
fi

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

# Used to tell Gateway server we're running in Cypress
RUNNING_IN_CYPRESS=true

if [ -z ${NODE_EXTRA_CA_CERTS+x} ]; then
  echo "NODE_EXTRA_CA_CERTS is unset in your bash config, see setup docs on how to set this."
  echo "Setting NODE_EXTRA_CA_CERTS locally for now."
  NODE_EXTRA_CA_CERTS="$(mkcert -CAROOT)/rootCA.pem"
else 
  echo "NODE_EXTRA_CA_CERTS is set."
fi

# In CI we build from the production config
if [[ "$DEV_MODE" == "false" ]]; then
  echo "building gateway"
  yarn build
fi

echo "starting mock server"
yarn mock-server &
yarn wait-on:mock-server
echo "starting gateway server, and waiting for https://profile.thegulocal.com/healthcheck"

# In CI we build from the start the production server
if [[ "$DEV_MODE" == "false" ]]; then
  yarn start &
  yarn wait-on:server
else
  # In DEV we want to watch and reload the server 
  yarn watch:server & yarn watch & yarn wait-on:server
fi

echo "opening cypress"
yarn cypress open --env $CI_ENV --config '{"testFiles":["mocked/**/*.ts"]}'

