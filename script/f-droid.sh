#!/bin/bash

#create android project with some adjustments

cd ..
yarn
npx expo prebuild
npx patch-package --patch-dir script/patches
