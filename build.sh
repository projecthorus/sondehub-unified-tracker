#!/bin/bash

set -e
TYPE_NAME=""

if [[ -z $1 ]];
then 
    echo "No parameter passed. AMATEUR or PROFESSIONAL?"
    exit 0
elif [[ $1 == AMATEUR ]]
then 
    TYPE_NAME="SondeHub Amateur"
elif [[ $1 == PROFESSIONAL ]] 
then
    TYPE_NAME="SondeHub Tracker"
else 
    echo "AMATEUR or PROFESSIONAL?"
    exit 0
fi

echo Building $1

VERSION="`git rev-parse --short HEAD`"
BUILD_DATE="`date -u +%Y-%m-%dT%H:%M:%SZ`"
# AMATEUR or PROFESSIONAL
TYPE=$1

# Amateur didn't have the creeate versioning previously
# create version check file
echo -n "Generating js/version.json... "
echo "{\"type\": \"$TYPE\", \"type_name\": \"$TYPE_NAME\", \"build_date\": \"$BUILD_DATE\", \"version\": \"$VERSION\", \"refresh\": 86400}" > js/version.json
echo "Done!"

# Type Configuration
echo -n "Generating index.html... "
sed -e "s/{VER}/$VERSION/" -e "s/{BUILD_DATE}/$BUILD_DATE/" -e "s/{TYPE}/$TYPE/" -e "s/{TYPE_NAME}/$TYPE_NAME/" index.template.html > index.html
echo "Done!"

echo -n "Generating opensearchspec.xml... "
sed -e "s/{TYPE_NAME}/$TYPE_NAME/" opensearchspec.template.xml > opensearchspec.xml
echo "Done!"

echo -n "Generating manifest.json... "
sed -e "s/{TYPE_NAME}/$TYPE_NAME/" manifest.template.json > manifest.json
echo "Done!"

# cache fixes
echo -n "Generating sondehubType.js... "
sed -e "s/{TYPE}/$TYPE/" sondehubType.template.js > js/sondehubType.js
echo "Done!"

echo -n "Generating service-worker.js... "
sed -e "s/{VER}/$VERSION/" service-worker.template.js > service-worker.js
echo "Done!"

echo "Build version: $VERSION Build date: $BUILD_DATE"
