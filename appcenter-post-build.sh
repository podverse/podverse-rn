#!/usr/bin/env bash

echo "Run appcenter-post-build.sh"

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
        echo "======= EMAILING Browserstack API URL ======="

        TO_ADDRESS="dev@podverse.fm"
        SUBJECT="Browserstack app build upload"
        BODY="A build was uploaded to Browserstack.\n\n\nPlatform: $PLATFORM\n\nBUILD #: $APPCENTER_BUILD_ID\n\nAPP_URL: $APP_URL \n\n"

        echo -e ${BODY} | mail -s "$SUBJECT - Success!" ${TO_ADDRESS}
        
        echo "======= Browserstack API URL EMAILED ======="

        jsonval() {
            temp=`echo $APP_URL | sed 's/\\\\\//\//g' | sed 's/[{}]//g' | awk -v k="text" '{n=split($0,a,","); for (i=1; i<=n; i++) print a[i]}' | sed 's/\"\:\"/\|/g' | sed 's/[\,]/ /g' | sed 's/\"//g' | grep -w "app_url"| cut -d":" -f1- | sed -e 's/^ *//g' -e 's/ *$//g'`
            echo ${temp##*|}
        }

        APP_ID=`jsonval`

        #Don't run tests on iOS for now
        if [ "$PLATFORM" == "ios" ] ; then
            echo "======= Skipping iOS Testing ======="
            rm -f "$APPCENTER_OUTPUT_DIRECTORY/build-$APPCENTER_BUILD_ID.ipa"
            exit 0
        fi

        echo "======= Browserstack TESTS REQUEST START ======="

        RUN_TESTS=$(curl -X GET "https://us-central1-podverse-staging-tests.cloudfunctions.net/runTests?APP_URL=$APP_ID&DEVICE_TYPE=$PLATFORM" -H "x-api-key: $FB_API_KEY")
        
        echo "======= Browserstack TESTS REQUEST END ======="
        
        if [ "$RUN_TESTS" == "Success" ]; then
         TO_ADDRESS="dev@podverse.fm"
         SUBJECT="Browserstack tests succeeded for build $APPCENTER_BUILD_ID"
         BODY="Browserstack tests have passed on $PLATFORM for id: $APP_ID. \n\n Info: \n\n $RUN_TESTS"

         echo -e ${BODY} | mail -s "$SUBJECT" ${TO_ADDRESS}
         echo "Browserstack Tests successfull!"
        else
         TO_ADDRESS="dev@podverse.fm"
         SUBJECT="Browserstack tests failure for build $APPCENTER_BUILD_ID"
         BODY="An error occured while running browserstack tests on $PLATFORM for id: $APP_ID. \n\n Info: \n\n $RUN_TESTS"

         echo -e ${BODY} | mail -s "$SUBJECT" ${TO_ADDRESS}
         echo "Browserstack Test Error: $RUN_TESTS"
        fi
        
     else
        echo "Current branch is $APPCENTER_BRANCH"
     fi
fi
