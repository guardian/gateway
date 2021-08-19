#!/bin/bash
# Quickly fire up Cypress using the CI settings for interactive local usage.

set -ae

trap 'kill $(jobs -p)' INT TERM EXIT

source .env
CI_ENV=$(cat .env | tr '\n' ',')
CI_ENV=${CI_ENV%?}
yarn build
yarn start &
yarn wait-on:server
yarn cypress open --env $CI_ENV
