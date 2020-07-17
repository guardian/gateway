#!/bin/bash

set -ae

trap 'kill $(jobs -pr)' INT TERM EXIT

yarn
yarn test
yarn build
source ci.env
yarn mock-server &
yarn wait-on:mock-server
yarn start &
yarn wait-on:server
yarn cypress:ci

