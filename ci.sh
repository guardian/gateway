#!/bin/bash

set -ae

# Don't remove this line as it's used to number the build based on the
# last build number in teamcity
LAST_TEAMCITY_BUILD=5000
export GITHUB_RUN_NUMBER=$(( $GITHUB_RUN_NUMBER + $LAST_TEAMCITY_BUILD ))

pnpm install --frozen-lockfile
pnpm run test
pnpm run build

(
    cd ./cdk
    pnpm install --frozen-lockfile
    pnpm run test
    pnpm run lint
    pnpm run synth
)

# Archive the contents of the build/ directory into a zip file
# ready for Riff-Raff - this replicates the behaviour of the old
# @guardian/node-riffraff-artifact.
cd build
zip -r ../identity-gateway.zip *
