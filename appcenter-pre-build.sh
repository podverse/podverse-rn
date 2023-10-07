#!/usr/bin/env bash

# NOTE: this is a 2nd yarn install that is needed to overcome a bug
# related to loading a remote git+ branch as a dependency in package.json
yarn

if [ "$PLATFORM" == "ios" ] ; then
    cd ./ios && rm -rf Pods && pod cache clean --all && pod install && cd ..
else
    npx jetify
fi

# Creates an .env from ENV variables for use with react-native-config
ENV_WHITELIST=${ENV_WHITELIST:-"^RN_"}
printf "Creating an .env file with the following whitelist:\n"
printf "%s\n" $ENV_WHITELIST
set | egrep -e $ENV_WHITELIST | sed 's/^RN_//g' > .env
printf "\n.env created with contents:\n\n"
cat .env

if [ "$APPCENTER_BRANCH" == "develop" ] ; then
    RESET_DB=$(curl --location --request GET "https://us-central1-podverse-staging-tests.cloudfunctions.net/resetStageDatabase" --header "x-api-key: $FB_API_KEY")

    if [ "$RESET_DB" == "Success" ]; then
        echo "Stage DB Reset successfull!"
    else
        echo "Stage DB Reset Errored. $RESET_DB"
    fi
fi