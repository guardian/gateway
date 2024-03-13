#!/bin/bash

set -ae

# Don't remove this line as it's used to number the build based on the
# last build number in teamcity
LAST_TEAMCITY_BUILD=5000
export GITHUB_RUN_NUMBER=$(( $GITHUB_RUN_NUMBER + $LAST_TEAMCITY_BUILD ))

pnpm install --frozen-lockfile
pnpm run test
pnpm run build
pnpm run riffraff
