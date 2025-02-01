#!/bin/bash
set -e

#create android project with some adjustments

yarn expo prebuild
echo "Small Android adjustments..."
# dark splash
cp ./scripts/xml/colors.xml \
  ./android/app/src/main/res/values-night/colors.xml
