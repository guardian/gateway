#!/bin/bash

set -ae

trap 'kill $(jobs -pr)' SIGINT SIGTERM EXIT

yarn
yarn test
yarn build
source ci.env
yarn mock-server &
yarn wait-on:mock-server
yarn start &
yarn wait-on:server
yarn cypress:ci

