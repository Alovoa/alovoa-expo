#!/bin/bash
set -e

# a script to make updating package.json easier and more consistent

# check what packages you want to upgrade
yarn upgrade-interactive --latest

# downgrade any that are known to be too high
yarn expo install --fix

# use exact version (remove ~ & ^)
sed -i '' 's/\("\)[~^]/\1/g' package.json

# make sure yarn.lock is up to date
yarn install

# check against the latest expo-doctor
yarn doctor
