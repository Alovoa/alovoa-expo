#!/bin/bash
set -ex

#create android project with some adjustments

# install dependencies
yarn install

# small android adjustments
./scripts/android.sh

# apply node_module patches (`rm -rf node_modules && yarn` to reverse)
yarn patch-package --patch-dir scripts/patches

# remove signing config block - does not work with `eas build`
perl -ni -e 'print unless /signingConfig /' filename
