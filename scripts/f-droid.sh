#!/bin/bash
set -ex

#create android project with some adjustments

# set flag for f-droid (hide donation button)
perl -pi -e 's/FLAG_FDROID = false/FLAG_FDROID = true/' Global.tsx

# small android adjustments
./scripts/android.sh

# apply node_module patches (`rm -rf node_modules && yarn` to reverse)
yarn patch-package --patch-dir scripts/patches

# remove signing config block - does not work with `eas build`
perl -ni -e 'print unless /signingConfig /' filename
