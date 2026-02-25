#!/bin/bash
# Quickly fire up Playwright using the CI settings for interactive local usage.

# Set DEV_MODE=true to run the mocked tests with the development server.
# We default to false here.
: "${DEV_MODE:=false}"

if [[ "$DEV_MODE" == "true" ]]; then
  echo "Running with development config and server..."
else
  echo "Running with production build..."
fi

echo "Opening Playwright e2e tests..."

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

# Used to tell Gateway server we're running in Playwright
RUNNING_IN_PLAYWRIGHT=true


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
  echo "This key is required to run these ete Playwright tests. Check your .env file." 
  echo
  exit
elif [[ -z "${CYPRESS_MAILOSAUR_SERVER_ID}" ]]; then
  echo "You don't have the CYPRESS_MAILOSAUR_SERVER_ID environment variable set!"
  echo
  echo "This ID is required to run these ete Playwright tests. Check your .env file." 
  echo
  exit
elif [[ -z "${CYPRESS_OKTA_ANDROID_CLIENT_ID}" ]]; then
  echo "You don't have the CYPRESS_OKTA_ANDROID_CLIENT_ID environment variable set!"
  echo
  echo "The Okta Android Client ID is required to run these ete Playwright tests. Check your .env file." 
  echo
  exit
fi

if [[ "$DEV_MODE" == "false" ]]; then
  echo "building gateway"
  pnpm run build
  echo "starting gateway server, and waiting for https://profile.thegulocal.com/healthcheck"
  pnpm run start &
  pnpm run wait-on:server
else
  echo "starting gateway server in watch and dev mode, and waiting for https://profile.thegulocal.com/healthcheck"
  pnpm run watch:server & pnpm run watch & pnpm run wait-on:server
fi

echo "opening playwright"
set -a
source .env
set +a
pnpm run playwright:e2e --ui
