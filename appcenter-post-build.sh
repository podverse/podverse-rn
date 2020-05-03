#!/usr/bin/env bash

if [ "$AGENT_JOBSTATUS" == "Succeeded" ]; then

    echo "======= Browserstack upload start ======="

    PATH=""
    if [ "$PLATFORM" == "ios" ] ;
     then
        PATH="@$APPCENTER_OUTPUT_DIRECTORY/podverse.ipa"
     else
        PATH="@$APPCENTER_OUTPUT_DIRECTORY/app-release.apk"
    fi

    if [ "$APPCENTER_BRANCH" == "develop" ];
     then
        APP_URL=$(curl -u "$BS_USERNAME:$BS_KEY" -X POST "https://api-cloud.browserstack.com/app-automate/upload" -F "file=@$APPCENTER_OUTPUT_DIRECTORY/app-release.apk")

        TO_ADDRESS="creon@podverse.fm"
        SUBJECT="Browserstack build upload complete"
        BODY="Build uploaded to browserstack. \n\n APP_URL: ${APP_URL}!\n\n"

        echo -e ${BODY} | mail -s "${SUBJECT} - Success!" ${TO_ADDRESS}

        echo "Upload to browserstack successful. App url: ${APP_URL}"
    else
        echo "Current branch is $APPCENTER_BRANCH"
    fi
fi