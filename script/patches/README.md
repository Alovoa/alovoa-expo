# f-droid patches

[patch-package](https://github.com/ds300/patch-package) is used to remove proprietary code from [f-droid builds](https://f-droid.org/en/packages/com.alovoa.expo/)

```bash
# apply existing patches to node_modules
yarn patch-package --patch-dir script/patches
```

```bash
# create new patches from updated node_modules
yarn patch-package expo-location --patch-dir script/patches
```

## patch-archive

patches no longer in use are located in `patch-archive` for reference

## expo-application

patched to remove `com.android.installreferrer`
dependency has been removed but patch kept for reference

## expo-location

patched to remove `com.google.android.gms` & `io.nlopez.smartlocation`
using `android.location.LocationManager` instead
