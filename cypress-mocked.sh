#!/bin/bash
# Quickly fire up Cypress using the CI settings for interactive local usage.

set -ae

trap 'kill $(jobs -p)' INT TERM EXIT

source cypress-mocked.env
CI_ENV=$(cat cypress-mocked.env | tr '\n' ',')
CI_ENV=${CI_ENV%?}
yarn build
yarn mock-server &
yarn wait-on:mock-server
yarn start &
yarn wait-on:server
yarn cypress open --env $CI_ENV --config '{"testFiles":["mocked/*.ts"]}'
