# How to setup Android for local testing

These steps were created with testing on an actual device in mind. To test with the Android Emulator, some of these steps may be unnecessary.

## Prerequisite

Before running the app locally, you will need to setup your [React Native development environment](https://reactnative.dev/docs/environment-setup) and follow the "React Native CLI Quickstart" guide.

You will also need Android Studio installed.

If you would like to use local test data with Podverse mobile, you can follow the steps in [How to setup local environment with test data](https://github.com/podverse/podverse-ops/blob/master/docs/how-to-setup-local-environment-with-test-data.md).

## Local setup

1. Create a `.env` file in the root of the `podverse-rn` repo. You can follow the `.env.example` file as an example.
2. Make sure your actual Android device has "[Use developer options](https://developer.android.com/studio/debug/dev-options)" enabled.
3. Make sure "USB debugging" is enabled on the "Developer Options" screen.
4. Plug in your Android device to your computer. Pull down from the top to reveal the notifications tray. Tap the "Android System" notification and select the USB's "Tap for more options" notification to reveal the "USB Preferences" menu. Select "USB Controlled by This Device" and "Use USB for PTP."
5. From your command line, run `adb reverse tcp:8081 tcp:8081`. (This will allow your device to communicate with your computer over port 8081, which is the port React Native Debugger runs on.)
6. If you are running `podverse-api` so you can test with local data, you will need to change the `API_DOMAIN` in the `.env` file to `API_DOMAIN='http://localhost:1234/api/v1'`, and also run `adb reverse tcp:1234 tcp:1234` so the Android device can communicate with your computer over port 1234.
7. From the root of the `podverse-rn` repo, run `npm run dev:android`. If all goes well, this should install Podverse on your Android device, and also open a terminal that runs the React Native server.
8. Sometimes you may need to restart the React Native server but do not need to rebuild the whole Android app. To restart the React Native server, from the root of `podverse-rn` repo, run `npm run dev`.

If you change any of the `.env` variables, you will need to rebuild the app with `npm run dev:android`.

If you update any translations in the i18n json files, you will need to restart the React Native server by running `npm run dev`.

Whenever you run `npm run dev:android`, you may need to re-run `adb reverse tcp:1234 tcp:1234` to reestablish a connection between the device and local Podverse API server.

## React Native Debugger UI

By default the Javascript / React Native logs will be output to your terminal that is running the React Native server. If you would like the output to be redirected to the React Native Debugger UI (which would allow you to use your web browser's developer console for debugging), then you will need to do the following:

1. In a web browser, open http://localhost:8081/debugger-ui/
2. Open the local build of Podverse mobile on your Android device.
3. Shake the device to reveal the React Native menu.
4. Tap the "Settings" option.
5. Tap the "Debug server host & port for device" option.
6. In the input, type `localhost:8081`, then press OK.
7. Go back into the mobile app, and shake it to reveal the React Native menu again.
8. Tap the "Debug" option.
9. If it worked, then in your web browser at http://localhost:8081/debugger-ui/ it should say "Status: Debugger session active." Open your web browser's developer tools console to view the JavaScript logs output.

Sometimes I have lost connection with the React Native Debugger UI, even after following those steps. Sometimes just running `npm run dev:android` will fix it.