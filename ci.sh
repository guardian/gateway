#!/bin/bash

set -ae

yarn install --frozen-lockfile
yarn lint
yarn test
yarn build
