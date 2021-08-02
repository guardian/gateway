#!/bin/bash

set -ae

yarn
yarn lint
yarn test
yarn build
