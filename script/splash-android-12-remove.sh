#!/bin/bash

# workaround because expo does not support the SplashScreen API for Android 12+ yet
cp ./res/android/app/src/main/res/values/styles.xml ../android/app/src/main/res/values/styles.xml
