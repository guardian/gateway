#!/bin/bash
# Quickly fire up Cypress using the CI settings for interactive local usage.

set -ae

trap 'kill $(jobs -p)' INT TERM EXIT

source .env

if [[ -z "${CYPRESS_MAILOSAUR_API_KEY}" ]]; then
  echo "You don't have the CYPRESS_MAILOSAUR_API_KEY environment variable set!"
  echo
  echo "This key is required to run these ete Cypress tests. You can find your api key here: https://mailosaur.com/app/servers/<your server id>/api" 
  echo
elif [[ -z "${CYPRESS_MAILOSAUR_SERVER_ID}" ]]; then
  echo "You don't have the CYPRESS_MAILOSAUR_SERVER_ID environment variable set!"
  echo
  echo "This ID is required to run these ete Cypress tests. You can find the ID here: https://mailosaur.com/app/servers" 
  echo
else
  CI_ENV=$(cat .env | tr '\n' ',')
  CI_ENV=${CI_ENV%?}
  yarn build
  yarn start &
  yarn wait-on:server
  yarn cypress run --env $CI_ENV --config '{"testFiles":["ete-okta/**/*.ts"]}'
fi
