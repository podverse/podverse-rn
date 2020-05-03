#!/usr/bin/env bash

echo "AGENT JOB STATUS: $AGENT_JOBSTATUS"

if [ "$AGENT_JOBSTATUS" == "Succeeded" ] ; then

    echo "======= Browserstack upload start ======="

    if [ "$PLATFORM" == "ios" ] ; then
        OUTPUT_PATH="$APPCENTER_OUTPUT_DIRECTORY/podverse.ipa"
     else
        OUTPUT_PATH="$APPCENTER_OUTPUT_DIRECTORY/app-release.apk"
    fi

    echo "Path is $OUTPUT_PATH"

    if [ "$APPCENTER_BRANCH" == "post-build-script" ] ; then
        APP_URL=$(curl -u "$BS_USERNAME:$BS_KEY" -X POST "https://api-cloud.browserstack.com/app-automate/upload" -F "file=@$OUTPUT_PATH")

        echo "======= Browserstack upload done ======="
        echo "Upload to browserstack successful. App url: $APP_URL"

        TO_ADDRESS="creon@podverse.fm"
        SUBJECT="Browserstack build upload complete"
        BODY="Build uploaded to browserstack. \n\n APP_URL: $APP_URL!\n\n"

        echo -e ${BODY} | mail -s "$SUBJECT - Success!" ${TO_ADDRESS}
    else
        echo "Current branch is $APPCENTER_BRANCH"
    fi
fi