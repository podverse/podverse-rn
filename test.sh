#!/usr/bin/env bash

APP_URL=$(curl -u "$BS_USERNAME:$BS_KEY" -X POST "https://api-cloud.browserstack.com/app-automate/upload" -F "file=@$APPCENTER_OUTPUT_DIRECTORY/app-release.apk")

echo "======= Browserstack upload done ======="
echo "Upload to browserstack successful. App url: $APP_URL"