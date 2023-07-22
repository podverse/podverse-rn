# Testing UnifiedPush in Podverse mobile

Podverse uses [UnifiedPush](https://unifiedpush.org/) to handle push notifications in our [F-Droid](https://f-droid.org) build. We use UnifiedPush because it is a FOSS compatible approach to push notification handling that is compliant with the F-Droid store's rules.

## How to test UP locally

Run the Podverse mobile app on the Android emulator or an actual device. 


Sample POST body:

```
{
    "body": "1573 - \"4 No Youth\"",
    "title": "No Agenda",
    "podcastId": "77Iu8L0Q8Tp",
    "episodeId": "09ImCLI78",
    "podcastTitle": "No Agenda",
    "episodeTitle": "1573 - \"4 No Youth\"",
    "notificationType": "new-episode",
    "timeSent": "{% now 'iso-8601', '' %}",
    "image": "https://cataas.com/cat"
}
```
