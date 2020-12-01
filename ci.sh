#!/bin/bash

set -ae

trap 'kill $(jobs -p)' INT TERM EXIT

yarn
yarn lint
yarn test
yarn build
yarn cypress install
source ci.env
CI_ENV=$(cat ci.env | tr '\n' ',')
CI_ENV=${CI_ENV%?}
yarn mock-server &
yarn wait-on:mock-server
yarn start &
yarn wait-on:server
yarn cypress:ci --env $CI_ENV

