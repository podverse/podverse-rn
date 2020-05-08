#!/usr/bin/env bash

if [ "$AGENT_JOBSTATUS" == "Succeeded" ] ; then

    if [ "$APPCENTER_BRANCH" == "develop" ] ; then
        echo "======= Browserstack upload start ======="

        if [ "$PLATFORM" == "ios" ] ; then
            cp "$APPCENTER_OUTPUT_DIRECTORY/podverse.ipa" "$APPCENTER_OUTPUT_DIRECTORY/build-$APPCENTER_BUILD_ID.ipa"
            OUTPUT_PATH="$APPCENTER_OUTPUT_DIRECTORY/build-$APPCENTER_BUILD_ID.ipa"
        else
            cp "$APPCENTER_OUTPUT_DIRECTORY/app-release.apk" "$APPCENTER_OUTPUT_DIRECTORY/build-$APPCENTER_BUILD_ID.apk"
            OUTPUT_PATH="$APPCENTER_OUTPUT_DIRECTORY/build-$APPCENTER_BUILD_ID.apk"
        fi

        echo "Path is $OUTPUT_PATH"

        APP_URL=$(curl -u "$BS_USERNAME:$BS_KEY" -X POST "https://api-cloud.browserstack.com/app-automate/upload" -F "file=@$OUTPUT_PATH")

        echo "======= Browserstack upload done ======="
        echo "Upload to browserstack successful. App url: $APP_URL"

        TO_ADDRESS="dev@podverse.fm"
        SUBJECT="Browserstack app build upload"
        BODY="A build was uploaded to Browserstack.\n\n\nPlatform: $PLATFORM\n\nBUILD #: $APPCENTER_BUILD_ID\n\nAPP_URL: $APP_URL \n\n"

        echo -e ${BODY} | mail -s "$SUBJECT - Success!" ${TO_ADDRESS}
        
        echo "======= Browserstack API URL EMAILED ======="
     else
        echo "Current branch is $APPCENTER_BRANCH"
     fi
fi
