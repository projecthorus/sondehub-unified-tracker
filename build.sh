#!/bin/bash

set -e

if [[ -z $1 ]];
then 
    echo "No parameter passed. AMATEUR or PROFESSIONAL?"
    exit 0
else
    echo Building $1
fi

VERSION="`git rev-parse --short HEAD`"
BUILD_DATE="`date -u +%Y-%m-%dT%H:%M:%SZ`"
# AMATEUR or PROFESSIONAL
TYPE=$1

# Amateur didn't have the creeate versioning previously
# create version check file
echo -n "Generating js/version.json... "
echo "{\"build_date\": \"$BUILD_DATE\", \"version\": \"$VERSION\", \"refresh\": 86400, \"type\": \"$TYPE\"}" > js/version.json
echo "Done!"

# cache fixes
echo -n "Generating index.html... "
sed -e "s/{VER}/$VERSION/" -e "s/{BUILD_DATE}/$BUILD_DATE/" -e "s/{TYPE}/$TYPE/" index.template.html > index.html
echo "Done!"

echo -n "Generating service-worker.js... "
sed -e "s/{TYPE}/$TYPE/" sondehubType.template.js > js/sondehubType.js
echo "Done!"

echo -n "Generating service-worker.js... "
sed -e "s/{VER}/$VERSION/" service-worker.template.js > service-worker.js
echo "Done!"

echo "Build version: $VERSION Build date: $BUILD_DATE"
