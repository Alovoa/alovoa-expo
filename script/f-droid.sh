#!/bin/bash

#create android project with some adjustments

cd ..
yarn
npx expo prebuild
cd script
cp -r ./res/node_modules/expo-location* ../node_modules/expo-location