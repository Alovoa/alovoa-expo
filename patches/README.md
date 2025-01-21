# node_modules patches

[patch-package](https://github.com/ds300/patch-package) is used to fix issues related to various node_modules. these are applied automatically after `yarn install` via `postinstall`

```bash
# apply patches to node_modules
yarn patch-package
```

```bash
# un-apply patches to node_modules
yarn patch-package --reverse
```

```bash
# create a new patch from updated node_modules
yarn patch-package react-native-card-stack-swiper
```
