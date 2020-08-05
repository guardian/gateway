#!/bin/bash
# Quickly fire up Cypress using the CI settings for interactive local usage.

set -ae

trap 'kill $(jobs -p)' INT TERM EXIT

source ci.env
yarn mock-server &
yarn wait-on:mock-server
yarn start &
yarn wait-on:server
yarn cypress open
