if [ "$AGENT_JOBSTATUS" == "Succeeded" ]; then

    # Example: Upload master branch app binary to HockeyApp using the API
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

       echo "BROWSERSTACK APP URL IS $APP_URL"
    else
        echo "Current branch is $APPCENTER_BRANCH"
    fi
fi