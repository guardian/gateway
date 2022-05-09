#!/bin/bash
# Quickly fire up Cypress using the CI settings for interactive local usage.

# Set DEV_MODE=true to run the mocked tests with the development server.
# We default to false here.
: "${DEV_MODE:=false}"

if [[ "$DEV_MODE" == "true" ]]; then
  echo "Running with development config and server..."
else
  echo "Running with production build..."
fi

# Set USE_OKTA=true to run the okta e2e tests.
# We default to false here.
: "${USE_OKTA:=false}"

if [[ "$USE_OKTA" == "true" ]]; then
  echo "Opening Cypress okta e2e tests..."
else
  echo "Opening Cypress e2e tests..."
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
source .env
CI_ENV=$(cat .env | tr '\n' ',')
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

if [[ -z "${CYPRESS_MAILOSAUR_API_KEY}" ]]; then
  echo "You don't have the CYPRESS_MAILOSAUR_API_KEY environment variable set!"
  echo
  echo "This key is required to run these ete Cypress tests. Check your .env file." 
  echo
  exit
elif [[ -z "${CYPRESS_MAILOSAUR_SERVER_ID}" ]]; then
  echo "You don't have the CYPRESS_MAILOSAUR_SERVER_ID environment variable set!"
  echo
  echo "This ID is required to run these ete Cypress tests. Check your .env file." 
  echo
  exit
fi

if [[ "$DEV_MODE" == "false" ]]; then
  echo "building gateway"
  yarn build
  echo "starting gateway server, and waiting for https://profile.thegulocal.com/healthcheck"
  yarn start &
  yarn wait-on:server
else
  echo "starting gateway server in watch and dev mode, and waiting for https://profile.thegulocal.com/healthcheck"
  yarn watch:server & yarn watch & yarn wait-on:server
fi

echo "opening cypress"
if [[ "$USE_OKTA" == "true" ]]; then
  yarn cypress open --env $CI_ENV --config '{"testFiles":["ete-okta/**/*.ts"]}'
else
  yarn cypress open --env $CI_ENV --config '{"testFiles":["ete/**/*.ts"]}'
fi
