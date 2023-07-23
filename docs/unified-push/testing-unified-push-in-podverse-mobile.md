# Testing UnifiedPush in Podverse mobile

Podverse uses [UnifiedPush](https://unifiedpush.org/) to handle push notifications in our [F-Droid](https://f-droid.org) build. We use UnifiedPush because it is a FOSS compatible approach to push notification handling that is compliant with the F-Droid store's rules.

## Prerequisites

In order to run Podverse mobile on an actual Android device, you will need to follow the steps in [How to setup Android for local testing
](https://github.com/podverse/podverse-rn/develop/docs/how-to-setup-android-for-local-testing.md).

https://github.com/podverse/podverse-rn/develop/docs/how-to-setup-android-for-local-testing.md

In addition to setting up your machine to run React Native, you will need to follow the steps in [How to setup local environment with test data](https://github.com/podverse/podverse-ops/blob/master/docs/how-to-setup-local-environment-with-test-data.md).

## How to test UP locally

1. Install a UP distribution app on your Android device (I have only used an app called ntfy).

Make sure you "Fix now" for battery optimization in ntfy???

2. Run the Podverse mobile app on the Android emulator or an actual device.
3. Login as a test user. (If you ran `populateDatabase` in podverse-api, then you could login as `premium@qa.podverse.fm` with password `Test!1Aa`. In order to connect to the ).
4. Go to More > Settings > Notifications and turn on "Enable Unified Push Notifications."
5. Select a distributor using the dropdown.
6. If Podverse pops an alert that asks you to allow Notifications, select Allow.
7. Check the JavaScript terminal for a log that says "Received UnifiedPush endpoint from default" and copy the URL it provides (example: https://ntfy.sh/upBuXXd7F4ZO3Y?up=1). This endpoint will be regenerated every time you enable/disable UnifiedPush notifications and select a distributor. 
8. Use a command line tool or a request tool (I use Postman) to send a POST request to the UnifiedPush endpoint URL that you copied in the previous step, set the header `Content-Type="application/json"`, and use a POST body like the sample below:

Sample POST body:

```
{
    "body": "Episode 141: Boosting is Loving",
    "title": "Podcasting 2.0",
    "podcastId": "peLVTHMwlg",
    "episodeId": "Z6OG4kalA",
    "podcastTitle": "Podcasting 2.0",
    "episodeTitle": "Episode 141: Boosting is Loving",
    "notificationType": "new-episode",
    "timeSent": "{% now 'iso-8601', '' %}",
    "image": "https://cataas.com/cat"
}
```
