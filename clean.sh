#!/usr/bin/env sh

######################################################################################
#  Script requirements:
#  - Yarn (brew install yarn)
#  - VSCode to be launchable from the command line. (If ran from terminal outside VSCode)
#    To enable this option open VSCode
#    Hit 'CMD + SHIFT + P'
#    Search and select "Shell Command: Install 'code' command in PATH"
#  
######################################################################################


kill -9 $(pgrep Electron)

echo "Killing packager..."

lsof -i :8081 | awk 'NR>1 {print $2}' | xargs kill -9 

echo "Killing listeners..."

watchman watch-del-all

echo "Cleaning android..."

./gradlew clean 2>/dev/null

echo "Cleaning ios..."

rm -rf ~/Library/Developer/Xcode/DerivedData 2>/dev/null

rm -rf ./ios/build 2>/dev/null

rm -rf ./ios/Pods 2>/dev/null

rm -rf ./ios/Podfile.lock 2>/dev/null

echo "Clearing node modules..."

rm -rf node_modules/ && yarn cache clean && yarn install && npx pod-install && yarn postinstall && code . && clear