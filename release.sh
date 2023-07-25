#!/bin/bash

CURRENT_DATE=$(date +"%d.%m.%Y")
VERSION_DATE=$(grep -m 1 "version" pack.toml | cut -d '"' -f 2 | cut -d '-' -f 1)

if [ "$CURRENT_DATE" != "$VERSION_DATE" ]; then
    BUILD=1
else
    BUILD=$(($(grep -m 1 "version" pack.toml | cut -d '"' -f 2 | cut -d '.' -f 4) + 1))
fi

VERSION="$CURRENT_DATE-build.$BUILD"
echo "New version: $VERSION"
sed -i "s/version = \".*\"/version = \"$VERSION\"/g" pack.toml

packwiz refresh

git add .
git commit -m "Release $VERSION"
git tag -a "$VERSION" -m "Release $VERSION"
git push
git push --tags
