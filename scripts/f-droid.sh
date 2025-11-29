#!/bin/bash
set -ex

#create android project with some adjustments

# small android adjustments
./scripts/android.sh

#use older expo-location that can be easily patched
yarn add expo-location@18.0.7

# apply node_module patches (`rm -rf node_modules && yarn` to reverse)
yarn patch-package --patch-dir scripts/patches

# remove signing config block - does not work with `eas build`
perl -ni -e 'print unless /signingConfig /' filename
