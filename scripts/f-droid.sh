#!/bin/bash
set -ex

#create android project with some adjustments

# small android adjustments
./scripts/android.sh

#use older expo-location that can be easily patched
yarn add expo-location@18.0.7

#remove expo-dev-client since it has non-free deps and only needed in development
yarn remove expo-dev-client

# apply node_module patches (`rm -rf node_modules && yarn` to reverse)
yarn patch-package --patch-dir scripts/patches

# only use v1SigningEnabled
perl -i -pe '
  # Patch the release buildType to use signingConfigs.debug and add flags
  if (/buildTypes\s*{/) { $in_buildtypes = 1 }
  if ($in_buildtypes && /release {/) { $in_release = 1 }
  if ($in_release && /signingConfig signingConfigs.debug/) {
    # keep debug keystore for release
    $_ .= "        v1SigningEnabled true\n";
    $_ .= "        v2SigningEnabled false\n";
    $_ .= "        v3SigningEnabled false\n";
    $_ .= "        v4SigningEnabled false\n";
    $in_release = 0;
  }
' android/app/build.gradle

