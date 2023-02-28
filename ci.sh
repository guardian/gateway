#!/bin/bash

set -ae

# Don't remove this line as it's used to number the build based on the
# last build number in teamcity
LAST_TEAMCITY_BUILD=5000
export GITHUB_RUN_NUMBER=$(( $GITHUB_RUN_NUMBER + $LAST_TEAMCITY_BUILD ))

corepack enable
corepack prepare pnpm@latest --activate
corepack pnpm install --frozen-lockfile
corepack pnpm run test
corepack pnpm run build
corepack pnpm run riffraff
