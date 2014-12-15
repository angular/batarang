#!/bin/bash
#
# Switch a dependency to git repo.
# Remove the NPM package and link it to a repo in parent directory.
DEP_NAME=$1
SCRIPT_DIR=$(dirname $0)
cd $SCRIPT_DIR/..

if [ -L ./node_modules/$DEP_NAME ]; then
  echo "$DEP_NAME is already a symlink"
else
  PKG_INFO=($($SCRIPT_DIR/read-pkg-url.js ./node_modules/$DEP_NAME/package.json))
  URL=${PKG_INFO[0]}
  DIR_NAME=${PKG_INFO[1]}

  echo "Switching $DEP_NAME"
  rm -rf ./node_modules/$DEP_NAME

  if [ -d ../$DIR_NAME ]; then
    echo "Repo already cloned in ../$DIR_NAME"
  else
    cd ..
    git clone $URL $DIR_NAME
    cd -
  fi

  echo "Link ./node_modules/$DEP_NAME -> ../$DIR_NAME"
  ln -s ../../$DIR_NAME ./node_modules/$DEP_NAME
fi
