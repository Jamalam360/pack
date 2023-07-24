#!/bin/bash

# extract the version from the pack.toml file
VERSION=$(grep -m 1 "version" pack.toml | cut -d '"' -f 2)

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
