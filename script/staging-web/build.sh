 #!/bin/bash

cd ../..
git fetch
git pull
yarn
oldpath=$(readlink dist)
newpath="dist-$(uuidgen)"
echo "$newpath"
yarn expo export -p web --output-dir=$newpath
ln -sfn $newpath dist

read -p "Delete old directory? ($oldpath) " -n 1 -r
echo    # (optional) move to a new line
if [[ $REPLY =~ ^[Yy]$ ]]
then
    rm -rf $oldpath
fi

