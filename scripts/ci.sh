#!/bin/bash

set -ae

trap 'kill $(jobs -pr)' SIGINT SIGTERM EXIT

source ci.env

yarn
yarn build
yarn test
yarn mock-server &
yarn start &
# WAITON
yarn cypress:ci

