#!/bin/bash

#create android project with some adjustments

yarn expo prebuild
echo "Small Android adjustments..."
# dark splash
cp ./script/xml/colors.xml \
  ./android/app/src/main/res/values-night/colors.xml
