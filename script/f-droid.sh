#!/bin/bash

#create android project with some adjustments

# small android adjustments
./script/android.sh
# apply node_module patches (`rm -rf node_modules && yarn` to reverse)
yarn patch-package --patch-dir script/patches
# remove signing config
sed -i -e '/signingConfig /d' android/app/build.gradle
