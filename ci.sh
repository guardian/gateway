#!/bin/bash

set -ae

trap 'kill $(jobs -p)' INT TERM EXIT

yarn
yarn lint
yarn test
yarn build
