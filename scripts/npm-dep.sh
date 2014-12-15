#!/bin/bash
#
# Switch a dependency to NPM.
# Remove the symlink and install from NPM.

DEP_NAME=$1
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/..

if [ ! -L ./node_modules/$DEP_NAME ]; then
  echo "$DEP_NAME is not a symlink"
else
  rm ./node_modules/$DEP_NAME
  npm install $DEP_NAME
fi
