#! /bin/bash
set -e

SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/..

# Build
yarn build --ignore-engines

# Run unit tests
SAUCE_ACCESS_KEY=`echo $SAUCE_ACCESS_KEY | rev`
yarn test --ignore-engines -- --sauce
