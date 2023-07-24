#!/bin/bash

# increment the version from the pack.toml file
VERSION=$(date +"%d.%m.%Y")-build.$(($(grep -m 1 "version" pack.toml | cut -d '"' -f 2 | cut -d '.' -f 4) + 1))

# write back to the pack.toml file
sed -i "s/version = \".*\"/version = \"$VERSION\"/g" pack.toml

# refresh
packwiz refresh

# commit
git add .
git commit -m "Release $VERSION"

# tag
git tag -a "$VERSION" -m "Release $VERSION"

# push
git push
git push --tags
